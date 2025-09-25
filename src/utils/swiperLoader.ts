/**
 * Swiper 加载器 - 避免重复加载 swiper 库
 * 提供统一的 swiper 加载和初始化管理
 */

// 全局状态管理
let swiperPromise: Promise<any> | null = null;
let swiperInstance: any = null;
let swiperCSSLoaded = false;

/**
 * 获取 Swiper 实例，确保只加载一次
 */
export async function getSwiper(): Promise<any> {
  if (swiperInstance) {
    return swiperInstance;
  }

  if (!swiperPromise) {
    swiperPromise = import('swiper/bundle').then((module) => {
      swiperInstance = module.default;
      console.log('Swiper 库加载成功');
      return swiperInstance;
    }).catch((error) => {
      console.error('Swiper 库加载失败:', error);
      swiperPromise = null; // 重置 promise，允许重试
      throw error;
    });
  }

  return swiperPromise;
}

/**
 * 检查是否已经加载了 Swiper
 */
export function isSwiperLoaded(): boolean {
  return swiperInstance !== null;
}

/**
 * 加载 Swiper CSS 样式
 */
export async function loadSwiperCSS(): Promise<void> {
  if (swiperCSSLoaded) {
    return;
  }

  try {
    // 动态加载 CSS - 使用动态导入避免类型错误
    const cssImports = [
      'swiper/css',
      'swiper/css/pagination', 
      'swiper/css/navigation'
    ];
    
    await Promise.all(
      cssImports.map(cssPath => 
        import(/* @vite-ignore */ cssPath).catch(() => {
          console.warn(`CSS 文件 ${cssPath} 加载失败，跳过`);
        })
      )
    );
    
    swiperCSSLoaded = true;
    console.log('Swiper CSS 加载成功');
  } catch (error) {
    console.error('Swiper CSS 加载失败:', error);
    throw error;
  }
}

/**
 * 初始化 Swiper 实例
 * @param selector 选择器
 * @param config 配置对象
 * @returns Swiper 实例
 */
export async function initSwiper(selector: string, config: any): Promise<any> {
  try {
    // 确保 Swiper 库已加载
    const Swiper = await getSwiper();
    
    // 检查容器是否存在
    const container = document.querySelector(selector);
    if (!container) {
      throw new Error(`Swiper 容器 ${selector} 未找到`);
    }

    // 创建 Swiper 实例
    const swiper = new Swiper(selector, {
      // 默认配置
      slidesPerView: 1,
      spaceBetween: 10,
      loop: false,
      autoplay: false,
      pagination: false,
      navigation: false,
      effect: 'slide',
      speed: 300,
      // 合并用户配置
      ...config
    });

    console.log(`Swiper ${selector} 初始化成功`);
    return swiper;
  } catch (error) {
    console.error(`Swiper ${selector} 初始化失败:`, error);
    throw error;
  }
}

/**
 * 批量初始化多个 Swiper 实例
 * @param configs 配置数组，每个配置包含 selector 和 config
 */
export async function initMultipleSwipers(configs: Array<{selector: string, config: any}>): Promise<any[]> {
  try {
    const Swiper = await getSwiper();
    const swipers: any[] = [];

    for (const { selector, config } of configs) {
      const container = document.querySelector(selector);
      if (container) {
        const swiper = new Swiper(selector, config);
        swipers.push(swiper);
        console.log(`Swiper ${selector} 初始化成功`);
      } else {
        console.warn(`Swiper 容器 ${selector} 未找到，跳过初始化`);
      }
    }

    return swipers;
  } catch (error) {
    console.error('批量初始化 Swiper 失败:', error);
    throw error;
  }
}

/**
 * 预加载 Swiper（在页面加载时提前加载）
 */
export function preloadSwiper(): void {
  if (!swiperPromise && !swiperInstance) {
    console.log('开始预加载 Swiper...');
    getSwiper().catch(error => {
      console.error('Swiper 预加载失败:', error);
    });
  }
}

/**
 * 重置 Swiper 加载状态（用于测试或重新加载）
 */
export function resetSwiperLoader(): void {
  swiperPromise = null;
  swiperInstance = null;
  swiperCSSLoaded = false;
  console.log('Swiper 加载器已重置');
}

/**
 * 获取 Swiper 加载状态信息
 */
export function getSwiperStatus(): {
  isLoaded: boolean;
  isCSSLoaded: boolean;
  hasPromise: boolean;
} {
  return {
    isLoaded: isSwiperLoaded(),
    isCSSLoaded: swiperCSSLoaded,
    hasPromise: swiperPromise !== null
  };
}
