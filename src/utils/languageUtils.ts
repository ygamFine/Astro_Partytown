/**
 * 语言工具函数集合
 * 用于处理多语言相关的功能，如获取当前语言、构建多语言URL等
 */

// 类型定义
export type LanguageCode = string;
export type Pathname = string;
export type Hostname = string;
export type BaseUrl = string;

/**
 * 获取当前语言
 * 优先从URL路径中获取，其次从子域名获取，默认为英语
 * @param pathname - 当前路径名
 * @param hostname - 当前主机名（可选）
 * @returns 当前语言代码
 */
export function getCurrentLanguage(pathname: Pathname, hostname: Hostname = ''): LanguageCode {
  // 优先从路径中获取语言
  const pathLangMatch: RegExpMatchArray | null = pathname.match(/^\/([a-z]{2}(-[A-Z]{2,4})?)(\/|$)/);
  if (pathLangMatch) {
    return pathLangMatch[1];
  }
  
  // 其次从子域名获取语言
  if (hostname) {
    const subdomainLangMatch: RegExpMatchArray | null = hostname.match(/^([a-z]{2}(-[A-Z]{2,4})?)\./);
    if (subdomainLangMatch) {
      return subdomainLangMatch[1];
    }
  }
  
  // 默认返回英语
  return 'en';
}

/**
 * 构建带语言的多语言URL
 * @param lang - 语言代码
 * @param path - 路径（不包含语言前缀）
 * @param baseUrl - 基础URL（可选）
 * @returns 完整的多语言URL
 */
export function buildLanguageUrl(lang: LanguageCode, path: string | null | undefined, baseUrl: BaseUrl = ''): string {
  // 空值过滤：如果path为null、undefined或空字符串，返回空字符串
  if (!path || path === null || path === undefined) {
    return '';
  }
  
  // 确保路径以/开头
  const normalizedPath: string = path.startsWith('/') ? path : `/${path}`;

  // 开发环境：使用路径前缀 /{lang}
  if (import.meta.env.DEV) {
    return baseUrl + `/${lang}${normalizedPath}`;
  }

  // 生产环境：二级域名承载语言，不再拼接语言后缀
  return baseUrl + normalizedPath;
}

/**
 * 从URL中移除语言前缀
 * @param pathname - 包含语言前缀的路径
 * @returns 移除语言前缀后的路径
 */
export function removeLanguagePrefix(pathname: Pathname): string {
  const langMatch: RegExpMatchArray | null = pathname.match(/^\/([a-z]{2}(-[A-Z]{2,4})?)(\/.*|$)/);
  if (langMatch) {
    return langMatch[2] || '/';
  }
  return pathname;
}

/**
 * 检查路径是否包含语言前缀
 * @param pathname - 要检查的路径
 * @returns 是否包含语言前缀
 */
export function hasLanguagePrefix(pathname: Pathname): boolean {
  return /^\/([a-z]{2}(-[A-Z]{2,4})?)(\/|$)/.test(pathname);
}
