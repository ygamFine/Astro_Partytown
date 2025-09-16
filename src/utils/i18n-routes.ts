import { getSupportedLanguages } from '@apis/common.js';

// 类型定义
export type LanguageCode = string;
export interface LanguageItem {
  localeCode: string;
  [key: string]: any;
}

// 动态获取支持的语言列表
let SUPPORTED_LANGUAGES: LanguageCode[] = [];

// 初始化语言列表
try {
  const supportedLanguages: LanguageItem[] = await getSupportedLanguages();
  supportedLanguages.map((item: LanguageItem) => {
    SUPPORTED_LANGUAGES.push(item.localeCode);
  })
  
} catch (e: any) {
  console.warn('[i18n] 获取语言列表失败，使用默认语言列表:', e?.message || e);
  SUPPORTED_LANGUAGES = ['en'];
}

export { SUPPORTED_LANGUAGES };
