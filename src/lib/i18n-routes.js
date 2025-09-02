import { getSupportedLanguages } from './languageConfig.js';

// 动态获取支持的语言列表
let SUPPORTED_LANGUAGES = [];

// 初始化语言列表
try {
  SUPPORTED_LANGUAGES = await getSupportedLanguages();
} catch (e) {
  console.warn('[i18n] 获取语言列表失败，使用默认语言列表:', e?.message || e);
  SUPPORTED_LANGUAGES = ['en'];
}

export { SUPPORTED_LANGUAGES };

// 生成所有支持语言的静态路径
export function generateStaticPaths() {
  if (!SUPPORTED_LANGUAGES.length) {
    console.warn('[i18n] 未获取到任何语言，generateStaticPaths 将返回空列表');
    return [];
  }
  
  const paths = SUPPORTED_LANGUAGES.map((lang) => ({
    params: { lang },
  }));
  
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