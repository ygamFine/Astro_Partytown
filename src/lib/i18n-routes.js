import { getSupportedLanguages } from './strapi.js';

// 动态支持的语言列表（构建/运行时从后端获取）
export const SUPPORTED_LANGUAGES = (await getSupportedLanguages()).map(l => l.code);

// 生成所有支持语言的静态路径
export function generateStaticPaths() {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    params: { lang },
  }));
}

// 获取语言名称（动态，尽量避免写死映射）
export function getLanguageName(locale) {
  try {
    // 使用浏览器/Node 的 Intl API 推断语言显示名
    const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
    const name = displayNames.of(locale);
    return name || locale;
  } catch {
    return locale;
  }
} 