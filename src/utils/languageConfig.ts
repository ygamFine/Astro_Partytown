/**
 * 统一的语言配置管理
 * 动态获取支持的语言列表，避免硬编码
 */

const PUBLIC_API_URL = process.env.PUBLIC_API_URL;
const STRAPI_TOKEN = process.env.PUBLIC_API_TOKEN;

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
    if (PUBLIC_API_URL) {
      const url = `${PUBLIC_API_URL}/api/i18n/locales`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_TOKEN}`
        }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
      const data = await res.json();
      if (data) {
        const rawList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const languages = rawList
          .map((item: LocaleItem) => item?.code || item?.attributes?.code || item?.id || item?.locale || null)
          .filter((item: string | null) => Boolean(item));
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
