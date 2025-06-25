/**
 * 公共ISR缓存管理器
 * 支持所有接口的智能缓存和自动更新
 * 类似Next.js ISR功能
 */

export class ISRCacheManager {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://47.251.126.80/api';
    this.token = options.token || '2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21';
    this.defaultCacheTimeout = options.defaultCacheTimeout || 30000; // 30秒
    this.enableNotifications = options.enableNotifications ?? true;
    this.enableLogs = options.enableLogs ?? true;
    this.retryTimes = options.retryTimes || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    // 缓存策略配置
    this.cacheStrategies = {
      menus: 30000,        // 菜单: 30秒
      news: 60000,         // 新闻: 1分钟
      products: 300000,    // 产品: 5分钟
      company: 3600000,    // 公司信息: 1小时
      ...options.cacheStrategies
    };
    
    // 活跃的检查器
    this.activeCheckers = new Map();
    
    // 初始化
    this.init();
  }
  
  init() {
    this.log('🚀 ISR缓存管理器初始化完成');
    this.addVisibilityChangeListener();
  }
  
  /**
   * 获取数据 - 主要方法
   * @param {string} endpoint - API端点 (如: 'menus', 'news', 'products')
   * @param {Object} options - 配置选项
   * @returns {Promise<any>} 数据
   */
  async getData(endpoint, options = {}) {
    const config = {
      cacheTimeout: this.getCacheTimeout(endpoint),
      transform: options.transform || this.getDefaultTransform(endpoint),
      enableAutoUpdate: options.enableAutoUpdate ?? true,
      ...options
    };
    
    const cacheKey = this.getCacheKey(endpoint, options.params);
    
    try {
      // 1. 尝试使用缓存
      const cached = this.getCached(cacheKey);
      if (cached && !this.isExpired(cached, config.cacheTimeout)) {
        this.log(`📋 使用缓存数据: ${endpoint}`);
        
        // 启动自动更新检查
        if (config.enableAutoUpdate) {
          this.startAutoUpdate(endpoint, options, config);
        }
        
        return cached.data;
      }
      
      // 2. 缓存过期或不存在，从API获取
      this.log(`🔄 从API获取数据: ${endpoint}`);
      const freshData = await this.fetchFromAPI(endpoint, options.params);
      const transformedData = config.transform ? config.transform(freshData) : freshData;
      
      // 3. 缓存新数据
      this.setCache(cacheKey, transformedData, config.cacheTimeout);
      
      // 4. 启动自动更新检查
      if (config.enableAutoUpdate) {
        this.startAutoUpdate(endpoint, options, config);
      }
      
      return transformedData;
      
    } catch (error) {
      this.log(`❌ 获取数据失败: ${endpoint}`, error);
      
      // 降级到缓存（即使过期）
      const cached = this.getCached(cacheKey);
      if (cached) {
        this.log(`🛡️ 使用过期缓存作为降级: ${endpoint}`);
        return cached.data;
      }
      
      throw error;
    }
  }
  
  /**
   * 从API获取数据 (通过代理)
   */
  async fetchFromAPI(endpoint, params = {}) {
    // 在浏览器环境中使用API代理
    const isClient = typeof window !== 'undefined';
    
    let url;
    let headers = {};
    
    if (isClient) {
      // 客户端：使用API代理
      url = new URL('/api/strapi-proxy', window.location.origin);
      url.searchParams.append('endpoint', endpoint);
      
      // 添加其他查询参数
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      
      headers = {
        'Content-Type': 'application/json'
      };
    } else {
      // 服务端：直接访问Strapi
      url = new URL(`${this.baseUrl}/${endpoint}`);
      
      // 添加查询参数
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      
      headers = {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      };
    }
    
    let lastError;
    
    // 重试机制
    for (let i = 0; i < this.retryTimes; i++) {
      try {
        this.log(`🔄 ${isClient ? '代理' : '直接'}请求 (${i + 1}/${this.retryTimes}): ${endpoint}`);
        
        const response = await fetch(url.toString(), { headers });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        this.log(`✅ 请求成功: ${endpoint}`);
        return data;
        
      } catch (error) {
        lastError = error;
        this.log(`⚠️ 第${i + 1}次请求失败: ${endpoint}`, error);
        
        if (i < this.retryTimes - 1) {
          await this.delay(this.retryDelay * (i + 1)); // 递增延迟
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * 启动自动更新检查
   */
  startAutoUpdate(endpoint, options, config) {
    const checkerId = this.getCheckerId(endpoint, options.params);
    
    // 避免重复启动
    if (this.activeCheckers.has(checkerId)) {
      return;
    }
    
    const intervalId = setInterval(async () => {
      try {
        await this.checkForUpdates(endpoint, options, config);
      } catch (error) {
        this.log(`⚠️ 自动更新检查失败: ${endpoint}`, error);
      }
    }, config.cacheTimeout);
    
    this.activeCheckers.set(checkerId, intervalId);
    this.log(`⏰ 启动自动更新检查: ${endpoint} (${config.cacheTimeout}ms)`);
  }
  
  /**
   * 检查更新
   */
  async checkForUpdates(endpoint, options, config) {
    const cacheKey = this.getCacheKey(endpoint, options.params);
    const cached = this.getCached(cacheKey);
    
    if (!cached) return;
    
    try {
      const freshData = await this.fetchFromAPI(endpoint, options.params);
      const transformedData = config.transform ? config.transform(freshData) : freshData;
      
      // 比较数据是否有变化
      if (JSON.stringify(transformedData) !== JSON.stringify(cached.data)) {
        this.log(`✨ 发现数据更新: ${endpoint}`);
        
        // 更新缓存
        this.setCache(cacheKey, transformedData, config.cacheTimeout);
        
        // 触发更新事件
        this.triggerUpdateEvent(endpoint, transformedData, cached.data);
        
        // 显示通知
        if (this.enableNotifications) {
          this.showUpdateNotification(endpoint);
        }
      }
    } catch (error) {
      this.log(`⚠️ 检查更新失败: ${endpoint}`, error);
    }
  }
  
  /**
   * 触发更新事件
   */
  triggerUpdateEvent(endpoint, newData, oldData) {
    const event = new CustomEvent('isr-update', {
      detail: {
        endpoint,
        newData,
        oldData,
        timestamp: Date.now()
      }
    });
    
    document.dispatchEvent(event);
    this.log(`📡 触发更新事件: ${endpoint}`);
  }
  
  /**
   * 显示更新通知
   */
  showUpdateNotification(endpoint) {
    // 移除现有通知
    const existing = document.querySelector('.isr-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'isr-notification';
    notification.innerHTML = `
      <div class="isr-notification-content">
        <span class="isr-notification-icon">✨</span>
        <span>${this.getUpdateMessage(endpoint)}</span>
      </div>
    `;
    
    // 添加样式
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '10000',
      animation: 'isrSlideIn 0.3s ease-out'
    });
    
    const content = notification.querySelector('.isr-notification-content');
    Object.assign(content.style, {
      background: '#10b981',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500'
    });
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
      notification.style.animation = 'isrFadeOut 0.3s ease-out forwards';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  /**
   * 获取更新消息
   */
  getUpdateMessage(endpoint) {
    const messages = {
      menus: '菜单已更新',
      news: '新闻已更新',
      products: '产品已更新',
      company: '公司信息已更新'
    };
    
    return messages[endpoint] || `${endpoint}已更新`;
  }
  
  /**
   * 获取缓存
   */
  getCached(cacheKey) {
    try {
      const stored = localStorage.getItem(cacheKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      this.log('缓存读取失败', error);
      return null;
    }
  }
  
  /**
   * 设置缓存
   */
  setCache(cacheKey, data, timeout) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        timeout
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      this.log('缓存写入失败', error);
    }
  }
  
  /**
   * 检查是否过期
   */
  isExpired(cached, timeout) {
    return (Date.now() - cached.timestamp) > timeout;
  }
  
  /**
   * 获取缓存键
   */
  getCacheKey(endpoint, params = {}) {
    const paramStr = Object.keys(params).length > 0 ? 
      '_' + Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&') : '';
    return `isr_cache_${endpoint}${paramStr}`;
  }
  
  /**
   * 获取检查器ID
   */
  getCheckerId(endpoint, params = {}) {
    return this.getCacheKey(endpoint, params) + '_checker';
  }
  
  /**
   * 获取缓存超时时间
   */
  getCacheTimeout(endpoint) {
    return this.cacheStrategies[endpoint] || this.defaultCacheTimeout;
  }
  
  /**
   * 获取默认数据转换器
   */
  getDefaultTransform(endpoint) {
    const transforms = {
      menus: (data) => data.data?.map(item => ({
        name: item.name,
        path: item.path,
        publishedAt: item.publishedAt
      })) || [],
      
      news: (data) => data.data?.map(item => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        publishedAt: item.publishedAt,
        image: item.image
      })) || [],
      
      products: (data) => data.data?.map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: item.price,
        image: item.image
      })) || []
    };
    
    return transforms[endpoint];
  }
  
  /**
   * 监听页面可见性变化
   */
  addVisibilityChangeListener() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.log('📱 页面重新可见，检查所有缓存更新...');
        this.checkAllUpdates();
      }
    });
  }
  
  /**
   * 检查所有活跃缓存的更新
   */
  async checkAllUpdates() {
    const promises = [];
    
    this.activeCheckers.forEach((intervalId, checkerId) => {
      const [endpoint, params] = this.parseCheckerId(checkerId);
      promises.push(this.checkForUpdates(endpoint, { params }, {
        cacheTimeout: this.getCacheTimeout(endpoint),
        transform: this.getDefaultTransform(endpoint)
      }));
    });
    
    await Promise.allSettled(promises);
  }
  
  /**
   * 解析检查器ID
   */
  parseCheckerId(checkerId) {
    const [, endpoint, paramStr] = checkerId.match(/isr_cache_([^_]+)(?:_(.+))?_checker/) || [];
    const params = paramStr ? Object.fromEntries(
      paramStr.split('&').map(p => p.split('='))
    ) : {};
    
    return [endpoint, params];
  }
  
  /**
   * 强制刷新缓存
   */
  async forceRefresh(endpoint, params = {}) {
    const cacheKey = this.getCacheKey(endpoint, params);
    localStorage.removeItem(cacheKey);
    
    this.log(`🔄 强制刷新缓存: ${endpoint}`);
    return this.getData(endpoint, { params });
  }
  
  /**
   * 清除所有缓存
   */
  clearAllCache() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('isr_cache_'));
    keys.forEach(key => localStorage.removeItem(key));
    
    this.log(`🗑️ 清除了 ${keys.length} 个缓存项`);
  }
  
  /**
   * 停止自动更新
   */
  stopAutoUpdate(endpoint, params = {}) {
    const checkerId = this.getCheckerId(endpoint, params);
    const intervalId = this.activeCheckers.get(checkerId);
    
    if (intervalId) {
      clearInterval(intervalId);
      this.activeCheckers.delete(checkerId);
      this.log(`⏹️ 停止自动更新: ${endpoint}`);
    }
  }
  
  /**
   * 停止所有自动更新
   */
  stopAllAutoUpdates() {
    this.activeCheckers.forEach((intervalId, checkerId) => {
      clearInterval(intervalId);
    });
    
    this.log(`⏹️ 停止了 ${this.activeCheckers.size} 个自动更新检查器`);
    this.activeCheckers.clear();
  }
  
  /**
   * 设置缓存策略
   */
  setCacheStrategy(endpoint, timeout) {
    this.cacheStrategies[endpoint] = timeout;
    this.log(`⚙️ 设置缓存策略: ${endpoint} = ${timeout}ms`);
  }
  
  /**
   * 获取缓存统计
   */
  getCacheStats() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('isr_cache_'));
    const stats = {
      totalCaches: keys.length,
      activeCheckers: this.activeCheckers.size,
      cacheItems: []
    };
    
    keys.forEach(key => {
      try {
        const cached = JSON.parse(localStorage.getItem(key));
        const age = Date.now() - cached.timestamp;
        const isExpired = age > cached.timeout;
        
        stats.cacheItems.push({
          key: key.replace('isr_cache_', ''),
          age: Math.round(age / 1000) + 's',
          timeout: Math.round(cached.timeout / 1000) + 's',
          isExpired,
          size: JSON.stringify(cached.data).length
        });
      } catch (error) {
        // 忽略损坏的缓存项
      }
    });
    
    return stats;
  }
  
  /**
   * 工具方法
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  log(message, ...args) {
    if (this.enableLogs) {
      console.log(`[ISR] ${message}`, ...args);
    }
  }
  
  /**
   * 销毁实例
   */
  destroy() {
    this.stopAllAutoUpdates();
    this.log('🔥 ISR缓存管理器已销毁');
  }
}

// 创建全局实例
export const isrCache = new ISRCacheManager();

// 添加CSS动画样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes isrSlideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes isrFadeOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);
}

// 开发模式下的全局访问
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
  window.isrCache = isrCache;
  console.log('🛠️ 开发模式 - ISR缓存管理器可通过 window.isrCache 访问');
} 