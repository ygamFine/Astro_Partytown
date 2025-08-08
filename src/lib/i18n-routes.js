import { getSupportedLanguages } from './strapi.js';

// 仅使用后端返回的语言列表，不做任何写死回退
let dynamicLanguages = [];
try {
  dynamicLanguages = await getSupportedLanguages();
} catch (e) {
  console.warn('[i18n] 获取语言列表失败，将不构建任何语言页面:', e?.message || e);
  dynamicLanguages = [];
}

const dynamicCodes = Array.isArray(dynamicLanguages)
  ? dynamicLanguages.map((l) => l.code).filter(Boolean)
  : [];

// 最终语言列表：严格等于后端返回
export const SUPPORTED_LANGUAGES = dynamicCodes;

// 生成所有支持语言的静态路径
export function generateStaticPaths() {
  if (!SUPPORTED_LANGUAGES.length) {
    console.warn('[i18n] 未获取到任何语言，generateStaticPaths 将返回空列表');
  }
  return SUPPORTED_LANGUAGES.map((lang) => ({
    params: { lang },
  }));
}

// 获取语言名称（动态，尽量避免写死映射）
export function getLanguageName(locale) {
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
    const name = displayNames.of(locale);
    return name || locale;
  } catch {
    return locale;
  }
} 