/**
 * ISR 配置管理
 * 统一管理所有页面的重新验证时间
 */

// 从环境变量获取基础重新验证时间
const BASE_REVALIDATE_TIME = parseInt(process.env.ISR_REVALIDATE_TIME) || 3600;

// 静态配置对象 - 避免运行时计算
export const ISR_CONFIG = {
  // 基础时间
  base: BASE_REVALIDATE_TIME,
  
  // 各页面类型的重新验证时间
  home: BASE_REVALIDATE_TIME,
  products: BASE_REVALIDATE_TIME,
  news: BASE_REVALIDATE_TIME,
  case: BASE_REVALIDATE_TIME,
  about: BASE_REVALIDATE_TIME * 2,      // 关于页面，更新频率较低
  contact: BASE_REVALIDATE_TIME * 2,    // 联系页面，更新频率较低
  search: BASE_REVALIDATE_TIME,
  default: BASE_REVALIDATE_TIME
};

// 静态常量 - 供页面直接使用
export const REVALIDATE_TIME = {
  HOME: ISR_CONFIG.home,
  PRODUCTS: ISR_CONFIG.products,
  NEWS: ISR_CONFIG.news,
  CASE: ISR_CONFIG.case,
  ABOUT: ISR_CONFIG.about,
  CONTACT: ISR_CONFIG.contact,
  SEARCH: ISR_CONFIG.search,
  DEFAULT: ISR_CONFIG.default
};

// 获取页面重新验证时间（静态值）
export function getPageRevalidateTime(pageType = 'default') {
  return ISR_CONFIG[pageType] || ISR_CONFIG.default;
}

// 验证重新验证时间是否有效
export function validateRevalidateTime(time) {
  const minTime = 60;      // 最小 1 分钟
  const maxTime = 86400;   // 最大 24 小时
  
  if (time < minTime) {
    console.warn(`ISR 重新验证时间 ${time} 秒过短，已调整为 ${minTime} 秒`);
    return minTime;
  }
  
  if (time > maxTime) {
    console.warn(`ISR 重新验证时间 ${time} 秒过长，已调整为 ${maxTime} 秒`);
    return maxTime;
  }
  
  return time;
}

// 格式化重新验证时间为可读格式
export function formatRevalidateTime(time) {
  if (time < 60) {
    return `${time} 秒`;
  } else if (time < 3600) {
    return `${Math.floor(time / 60)} 分钟`;
  } else if (time < 86400) {
    return `${Math.floor(time / 3600)} 小时`;
  } else {
    return `${Math.floor(time / 86400)} 天`;
  }
} 