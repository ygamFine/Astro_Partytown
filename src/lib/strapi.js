/**
 * Strapi 5 API 集成 - 使用公共ISR缓存管理器
 * 支持智能重试和多endpoint备用
 */

import { isrCache } from './isr-cache.js';

/**
 * 获取菜单数据 (使用ISR缓存)
 */
export async function getMenus() {
  try {
    return await isrCache.getData('menus');
  } catch (error) {
    console.error('❌ 获取菜单失败:', error);
    throw error;
  }
}

/**
 * 获取新闻数据 (使用ISR缓存)
 */
export async function getNews(params = {}) {
  try {
    return await isrCache.getData('news', { params });
  } catch (error) {
    console.error('❌ 获取新闻失败:', error);
    throw error;
  }
}

/**
 * 获取产品数据 (使用ISR缓存)
 */
export async function getProducts(params = {}) {
  try {
    return await isrCache.getData('products', { params });
  } catch (error) {
    console.error('❌ 获取产品失败:', error);
    throw error;
  }
}

/**
 * 获取公司信息 (使用ISR缓存)
 */
export async function getCompanyInfo() {
  try {
    return await isrCache.getData('company');
  } catch (error) {
    console.error('❌ 获取公司信息失败:', error);
    throw error;
  }
}

/**
 * 强制刷新指定接口数据
 */
export async function forceRefresh(endpoint, params = {}) {
  try {
    return await isrCache.forceRefresh(endpoint, params);
  } catch (error) {
    console.error(`❌ 强制刷新${endpoint}失败:`, error);
    throw error;
  }
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
  return isrCache.getCacheStats();
}

/**
 * 清除所有缓存
 */
export function clearAllCache() {
  return isrCache.clearAllCache();
}

/**
 * 设置缓存策略
 */
export function setCacheStrategy(endpoint, timeout) {
  return isrCache.setCacheStrategy(endpoint, timeout);
}

/**
 * 停止自动更新
 */
export function stopAutoUpdate(endpoint, params = {}) {
  return isrCache.stopAutoUpdate(endpoint, params);
}

/**
 * 停止所有自动更新
 */
export function stopAllAutoUpdates() {
  return isrCache.stopAllAutoUpdates();
}

/**
 * 测试API连接
 */
export async function testConnection() {
  try {
    const menus = await isrCache.getData('menus', { enableAutoUpdate: false });
    return {
      success: true,
      status: 200,
      statusText: 'OK',
      menuCount: menus.length,
      message: '连接成功'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: '连接失败'
    };
  }
}

// 开发模式下的全局访问
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
  window.strapiAPI = {
    getMenus,
    getNews,
    getProducts,
    getCompanyInfo,
    forceRefresh,
    getCacheStats,
    clearAllCache,
    setCacheStrategy,
    stopAutoUpdate,
    stopAllAutoUpdates,
    testConnection
  };
  console.log('🛠️ 开发模式 - Strapi API可通过 window.strapiAPI 访问');
} 