/**
 * 语言工具函数集合
 * 用于处理多语言相关的功能，如获取当前语言、构建多语言URL等
 */

/**
 * 获取当前语言
 * 优先从URL路径中获取，其次从子域名获取，默认为英语
 * @param {string} pathname - 当前路径名
 * @param {string} hostname - 当前主机名（可选）
 * @returns {string} 当前语言代码
 */
export function getCurrentLanguage(pathname, hostname = '') {
  // 优先从路径中获取语言
  const pathLangMatch = pathname.match(/^\/([a-z]{2}(-[A-Z]{2,4})?)(\/|$)/);
  if (pathLangMatch) {
    return pathLangMatch[1];
  }
  
  // 其次从子域名获取语言
  if (hostname) {
    const subdomainLangMatch = hostname.match(/^([a-z]{2}(-[A-Z]{2,4})?)\./);
    if (subdomainLangMatch) {
      return subdomainLangMatch[1];
    }
  }
  
  // 默认返回英语
  return 'en';
}

/**
 * 构建带语言的多语言URL
 * @param {string} lang - 语言代码
 * @param {string} path - 路径（不包含语言前缀）
 * @param {string} baseUrl - 基础URL（可选）
 * @returns {string} 完整的多语言URL
 */
export function buildLanguageUrl(lang, path, baseUrl = '') {
  // 空值过滤：如果path为null、undefined或空字符串，返回空字符串
  if (!path || path === null || path === undefined) {
    return '';
  }
  
  // 确保路径以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 所有语言都添加语言前缀，保持一致性
  return baseUrl + `/${lang}${normalizedPath}`;
}

/**
 * 从URL中移除语言前缀
 * @param {string} pathname - 包含语言前缀的路径
 * @returns {string} 移除语言前缀后的路径
 */
export function removeLanguagePrefix(pathname) {
  const langMatch = pathname.match(/^\/([a-z]{2}(-[A-Z]{2,4})?)(\/.*|$)/);
  if (langMatch) {
    return langMatch[2] || '/';
  }
  return pathname;
}

/**
 * 检查路径是否包含语言前缀
 * @param {string} pathname - 要检查的路径
 * @returns {boolean} 是否包含语言前缀
 */
export function hasLanguagePrefix(pathname) {
  return /^\/([a-z]{2}(-[A-Z]{2,4})?)(\/|$)/.test(pathname);
}
