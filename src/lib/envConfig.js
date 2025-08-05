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
  
  const domain = getCurrentDomain();
  // 检查是否为子域名模式（如 en.aihuazhi.cn）
  return domain.includes('.aihuazhi.cn') && domain !== 'aihuazhi.cn' && domain !== 'www.aihuazhi.cn';
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
  const langPrefix = getLangPrefix(lang);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (useSubdomainMode()) {
    // 子域名模式：直接返回路径
    return cleanPath;
  } else {
    // 本地开发模式：添加语言前缀
    return `${langPrefix}${cleanPath}`;
  }
};

// 获取语言切换URL
export const getLanguageSwitchUrl = (currentLang, targetLang, currentPath) => {
  if (useSubdomainMode()) {
    // 子域名模式：构建子域名URL
    const subdomain = targetLang === 'zh-CN' ? 'zh' : targetLang === 'zh-Hant' ? 'zh-hant' : targetLang;
    return `https://${subdomain}.aihuazhi.cn${currentPath}`;
  } else {
    // 本地开发模式：替换语言前缀
    const pathWithoutLang = currentPath.replace(/^\/([a-z]{2}(-[A-Z]{2,4})?)(\/|$)/, '/');
    return `/${targetLang}${pathWithoutLang}`;
  }
}; 