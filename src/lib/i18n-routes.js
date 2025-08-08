import { getSupportedLanguages } from './strapi.js';

// 默认语言列表作为回退，确保所有必要的语言路径都能生成
const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English' },
];

// 尝试从后端获取语言列表，失败时使用默认列表
let dynamicLanguages = [];
try {
  dynamicLanguages = await getSupportedLanguages();
  console.log('[i18n] 从Strapi API获取到的语言列表:', dynamicLanguages);
} catch (e) {
  console.warn('[i18n] 获取语言列表失败，使用默认语言列表:', e?.message || e);
  dynamicLanguages = DEFAULT_LANGUAGES;
}

const dynamicCodes = Array.isArray(dynamicLanguages) && dynamicLanguages.length > 0
  ? dynamicLanguages.map((l) => l.code).filter(Boolean)
  : DEFAULT_LANGUAGES.map((l) => l.code);

// 最终语言列表：优先使用后端返回，失败时使用默认列表
export const SUPPORTED_LANGUAGES = dynamicCodes;

// 生成所有支持语言的静态路径
export function generateStaticPaths() {
  console.log('[i18n] 生成静态路径，支持的语言:', SUPPORTED_LANGUAGES);
  
  if (!SUPPORTED_LANGUAGES.length) {
    console.warn('[i18n] 未获取到任何语言，generateStaticPaths 将返回空列表');
    return [];
  }
  
  const paths = SUPPORTED_LANGUAGES.map((lang) => ({
    params: { lang },
  }));
  
  console.log('[i18n] 生成的路径:', paths);
  return paths;
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