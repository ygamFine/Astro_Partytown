/**
 * 环境配置
 * 用于区分本地开发和生产环境的URL策略
 */

// 检查是否为生产环境
export const isProduction = import.meta.env.PROD;

// 检查是否为本地开发环境
export const isDevelopment = import.meta.env.DEV;

// 获取当前域名
export const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return '';
};

// 判断是否使用子域名模式
export const useSubdomainMode = () => {
  if (isDevelopment) {
    return false; // 本地开发使用语言标识
  }
  
  // 生产环境默认使用子域名模式
  return true;
};

// 获取语言前缀
export const getLangPrefix = (lang) => {
  if (useSubdomainMode()) {
    return ''; // 子域名模式不需要语言前缀
  }
  return `/${lang}`; // 本地开发模式需要语言前缀
};

// 构建URL
export const buildUrl = (lang, path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (isDevelopment) {
    // 本地开发模式：添加语言前缀
    return `/${lang}${cleanPath}`;
  } else {
    // 生产环境：子域名模式，直接返回路径
    return cleanPath;
  }
};

// 获取语言切换URL
export const getLanguageSwitchUrl = (currentLang, targetLang, currentPath) => {
  if (useSubdomainMode()) {
    // 子域名模式：构建子域名URL
    const subdomain = targetLang === 'zh-CN' ? 'zh' : targetLang === 'zh-Hant' ? 'zh-hant' : targetLang;
    const currentDomain = getCurrentDomain();
    const baseDomain = currentDomain.split('.').slice(-2).join('.'); // 获取主域名
    return `https://${subdomain}.${baseDomain}${currentPath}`;
  } else {
    // 本地开发模式：替换语言前缀
    const pathWithoutLang = currentPath.replace(/^\/([a-z]{2}(-[A-Z]{2,4})?)(\/|$)/, '/');
    return `/${targetLang}${pathWithoutLang}`;
  }
}; 