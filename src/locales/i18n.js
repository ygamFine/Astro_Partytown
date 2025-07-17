// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  'en', 'zh-CN', 'zh-Hant', 'fr', 'de', 'it', 'tr', 'es', 'pt-pt', 
  'nl', 'pl', 'ar', 'ru', 'th', 'id', 'vi', 'ms', 'ml', 'my', 'hi', 'ja', 'ko'
];

// 默认语言
export const DEFAULT_LANGUAGE = 'en';

// 获取语言名称（用于显示）
export function getLanguageName(locale) {
  const names = {
    'en': 'English',
    'zh-CN': '简体中文',
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
    'ko': '한국어',
  };
  return names[locale] || locale;
}

// 从路径中提取语言
export function getLocaleFromPath(pathname) {
  const match = pathname.match(/^\/([a-z]{2}(-[a-z]{2,4})?)\//);
  return match ? match[1] : DEFAULT_LANGUAGE;
}

// 获取翻译文件
export async function loadTranslations(locale, namespace) {
  try {
    const translations = await import(`../locales/${locale}/${namespace}.json`);
    return translations.default || {};
  } catch (error) {
    // 加载失败时回退到默认语言
    if (locale !== DEFAULT_LANGUAGE) {
      return loadTranslations(DEFAULT_LANGUAGE, namespace);
    }
    return {};
  }
}

// 合并多个命名空间的翻译
export async function mergeTranslations(locale, namespaces) {
  const translations = {};
  for (const namespace of namespaces) {
    const nsTranslations = await loadTranslations(locale, namespace);
    translations[namespace] = nsTranslations;
  }
  return translations;
}