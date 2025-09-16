/**
 * 统一的语言配置管理
 * 动态获取支持的语言列表，避免硬编码
 */

// 类型定义
interface LocaleItem {
  code?: string;
  attributes?: {
    code?: string;
  };
  id?: string;
  locale?: string;
}

interface ApiResponse {
  data?: LocaleItem[];
}

/**
 * 动态获取支持的语言列表
 * @returns 支持的语言代码数组
 */
export async function getSupportedLanguages(): Promise<string[]> {
  // 如果没有环境变量，尝试从 Strapi API 获取
  try {
    const { STRAPI_STATIC_URL, fetchJson } = await import('../apis/apiClient.ts');

    if (STRAPI_STATIC_URL) {
      const url = `${STRAPI_STATIC_URL}/api/i18n/locales`;
      const data = await fetchJson(url).catch(() => null);
      if (data) {
        const rawList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const languages = rawList
          .map((item: LocaleItem) => item?.code || item?.attributes?.code || item?.id || item?.locale || null)
          .filter((item): item is string => Boolean(item));
        if (languages.length > 0) return languages;
      }
    }
  } catch (error: any) {
    console.warn('无法从 API 获取语言列表，使用默认配置:', error.message);
  }
  // 回退到默认语言列表
  return ['en'];
}

/**
 * 获取默认语言
 * @returns 默认语言代码
 */
export function getDefaultLanguage(): string {
  return 'en';
}

/**
 * 检查是否为 RTL 语言
 * @param lang 语言代码
 * @returns 是否为 RTL 语言
 */
export function isRTL(lang: string): boolean {
  const RTL_LANGUAGES = ['ar'];
  return RTL_LANGUAGES.includes(lang);
}

/**
 * 语言到子域名的映射配置
 */
export const LANG_TO_SUBDOMAIN: Record<string, string> = {
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
export const SUBDOMAIN_TO_LANG: Record<string, string> = Object.fromEntries(
  Object.entries(LANG_TO_SUBDOMAIN).map(([lang, sub]) => [sub, lang])
);

/**
 * 语言显示名称映射
 */
export const LANGUAGE_NAMES: Record<string, string> = {
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
 * 语言代码转子域名
 * @param lang 语言代码
 * @returns 子域名
 */
export function langToSubdomain(lang: string): string {
  return LANG_TO_SUBDOMAIN[lang] || 'en';
}
