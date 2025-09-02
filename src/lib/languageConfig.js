/**
 * 统一的语言配置管理
 * 动态获取支持的语言列表，避免硬编码
 */

/**
 * 动态获取支持的语言列表
 * @returns {Promise<string[]>} 支持的语言代码数组
 */
export async function getSupportedLanguages() {
  // 如果没有环境变量，尝试从 Strapi API 获取
  try {
    const { STRAPI_STATIC_URL, fetchJson } = await import('./strapiClient.js');

    if (STRAPI_STATIC_URL) {
      const url = `${STRAPI_STATIC_URL}/api/i18n/locales`;
      const data = await fetchJson(url).catch(() => null);
      if (data) {
        const rawList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const languages = rawList
          .map((item) => item?.code || item?.attributes?.code || item?.id || item?.locale || null)
          .filter(Boolean);
        if (languages.length > 0) return languages;
      }
    }
  } catch (error) {
    console.warn('无法从 API 获取语言列表，使用默认配置:', error.message);
  }
  // 回退到默认语言列表
  return ['en'];
}

/**
 * 获取默认语言
 * @returns {string} 默认语言代码
 */
export function getDefaultLanguage() {
  return 'en';
}

/**
 * 检查是否为 RTL 语言
 * @param {string} lang 语言代码
 * @returns {boolean} 是否为 RTL 语言
 */
export function isRTL(lang) {
  const RTL_LANGUAGES = ['ar'];
  return RTL_LANGUAGES.includes(lang);
}

/**
 * 语言到子域名的映射配置
 */
export const LANG_TO_SUBDOMAIN = {
  'en': 'en',
  'zh-Hans': 'zh',
  'zh-Hant': 'zh-hant',
  'fr': 'fr',
  'de': 'de',
  'it': 'it',
  'tr': 'tr',
  'es': 'es',
  'pt-pt': 'pt',
  'nl': 'nl',
  'pl': 'pl',
  'ar': 'ar',
  'ru': 'ru',
  'th': 'th',
  'id': 'id',
  'vi': 'vi',
  'ms': 'ms',
  'ml': 'ml',
  'my': 'my',
  'hi': 'hi',
  'ja': 'ja',
  'ko': 'ko'
};

/**
 * 子域名到语言的反向映射
 */
export const SUBDOMAIN_TO_LANG = Object.fromEntries(
  Object.entries(LANG_TO_SUBDOMAIN).map(([lang, sub]) => [sub, lang])
);

/**
 * 语言显示名称映射
 */
export const LANGUAGE_NAMES = {
  'en': 'English',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'tr': 'Türkçe',
  'es': 'Español',
  'pt-pt': 'Português',
  'nl': 'Nederlands',
  'pl': 'Polski',
  'ar': 'العربية',
  'ru': 'Русский',
  'th': 'ไทย',
  'id': 'Bahasa Indonesia',
  'vi': 'Tiếng Việt',
  'ms': 'Bahasa Melayu',
  'ml': 'മലയാളം',
  'my': 'မြန်မာဘာသာ',
  'hi': 'हिन्दी',
  'ja': '日本語',
  'ko': '한국어'
};

/**
 * 获取语言显示名称
 * @param {string} code 语言代码
 * @returns {string} 语言显示名称
 */
export function getLanguageName(code) {
  return LANGUAGE_NAMES[code] || code;
}

/**
 * 语言代码转子域名
 * @param {string} lang 语言代码
 * @returns {string} 子域名
 */
export function langToSubdomain(lang) {
  return LANG_TO_SUBDOMAIN[lang] || 'en';
}

/**
 * 子域名转语言代码
 * @param {string} sub 子域名
 * @returns {string} 语言代码
 */
export function subdomainToLang(sub) {
  return SUBDOMAIN_TO_LANG[sub] || 'en';
}

/**
 * 从主机名获取语言代码
 * @param {string} hostname 主机名
 * @returns {string} 语言代码
 */
export function getLangFromHostname(hostname) {
  if (!hostname) return 'en';
  const firstLabel = hostname.split('.')[0];
  return subdomainToLang(firstLabel);
}
