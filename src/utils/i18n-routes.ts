import { getSupportedLanguages } from '@apis/common.js';

// 类型定义
export type LanguageCode = string;
export interface LanguageItem {
  localeCode: string;
  [key: string]: any;
}

// 动态获取支持的语言列表
let SUPPORTED_LANGUAGES: LanguageCode[] = [];

// 初始化语言列表（保证最少包含 'en'）
try {
  const supportedLanguages: LanguageItem[] = await getSupportedLanguages();
  const languages = Array.isArray(supportedLanguages)
    ? supportedLanguages
        .map((item: LanguageItem) => (item?.localeCode as string) || '')
        .filter((code: string) => Boolean(code))
    : [];

  SUPPORTED_LANGUAGES = languages.length > 0 ? Array.from(new Set(languages)) : ['en'];
} catch (e: any) {
  console.warn('[i18n] 获取语言列表失败，使用默认语言列表:', e?.message || e);
  SUPPORTED_LANGUAGES = ['en'];
}

export { SUPPORTED_LANGUAGES };
