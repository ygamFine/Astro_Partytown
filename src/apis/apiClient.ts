// 统一的 Strapi HTTP 客户端（构建期/运行期均可用，纯 fetch + env）

import { config } from 'dotenv';
config();


import { getSecret } from 'astro:env/server'

// 类型定义
interface StrapiResponse<T = any> {
  data: T | null;
}

interface RequestHeaders {
  'Content-Type': string;
  'Authorization': string;
  [key: string]: string;
}

export const PUBLIC_API_URL: string | undefined = getSecret('PUBLIC_API_URL');
export const STRAPI_TOKEN: string | undefined = getSecret('PUBLIC_API_TOKEN');
const DISABLE_PNC_FETCH_RAW: string | undefined = getSecret('PUBLIC_DISABLE_PNC_FETCH');
export const DISABLE_PNC_FETCH: boolean = DISABLE_PNC_FETCH_RAW === '1' || (DISABLE_PNC_FETCH_RAW || '').toLowerCase() === 'true';
console.log('DISABLE_PNC_FETCH 环境变量', DISABLE_PNC_FETCH);
function shouldBypassBusinessData(url: string): boolean {
  if (!DISABLE_PNC_FETCH) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('/api/product-manages') ||
    lowerUrl.includes('/api/news') ||
    lowerUrl.includes('/api/cases')
  );
}

function buildHeaders(): RequestHeaders {
  const headers: RequestHeaders = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
   };
  return headers;
}

export async function fetchJson<T = any>(url: string): Promise<StrapiResponse<T>> {
  try {
    // 按开关跳过产品/新闻/案例数据请求，直接返回空数据
    if (shouldBypassBusinessData(url)) {
      return { data: [] } as StrapiResponse<T>;
    }

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    const res = await fetch(url, { 
      headers: buildHeaders(),
      signal: controller.signal
    });
    console.log('执行了实际的数据获取', url)
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
    return res.json();
  } catch (error) {
    // Strapi 网络请求失败
    // 在构建环境下，网络请求失败是常见的，不应该中断构建
    if (getSecret('NODE_ENV') === 'production' || getSecret('VERCEL')) {
      // 构建环境网络请求失败，返回空数据
      return { data: null };
    }
    throw error;
  }
}