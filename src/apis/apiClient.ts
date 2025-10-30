// 统一的 Strapi HTTP 客户端（构建期/运行期均可用，纯 fetch + env）

import { config } from 'dotenv';
config();

import { getSecret } from 'astro:env/server'

const ITALKIN_API_URL: string = 'https://test.italkin.com';

// 类型定义
interface StrapiResponse<T = any> {
  data: T | null;
}

interface RequestHeaders {
  'Content-Type': string;
  'Authorization': string;
  [key: string]: string;
}

// SSG 模式下的内存缓存
// 缓存结构：{ [url]: { data: response, timestamp: number } }
const apiCache = new Map<string, { data: any; timestamp: number }>();

// 获取缓存数据
function getCachedData(url: string): any | null {
  const cached = apiCache.get(url);
  if (cached) {
    // console.log(`缓存命中: ${url}`);
    return cached.data;
  }
  return null;
}

// 设置缓存数据
function setCachedData(url: string, data: any): void {
  apiCache.set(url, {
    data,
    timestamp: Date.now()
  });
  // console.log(`缓存已设置: ${url}`);
}

export const PUBLIC_API_URL: string | undefined = getSecret('PUBLIC_API_URL');
export const STRAPI_TOKEN: string | undefined = getSecret('PUBLIC_API_TOKEN');
export const ITALKIN_API: string | undefined = getSecret('ITALKIN_API') || ITALKIN_API_URL;
const DISABLE_PNC_FETCH_RAW: string | undefined = getSecret('PUBLIC_DISABLE_PNC_FETCH');
export const DISABLE_PNC_FETCH: boolean = DISABLE_PNC_FETCH_RAW === '1' || (DISABLE_PNC_FETCH_RAW || '').toLowerCase() === 'true';
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

    // 尝试从缓存获取数据
    const cachedData = getCachedData(url);
    if (cachedData !== null) {
      return cachedData;
    }

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    const res = await fetch(url, { 
      headers: buildHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
    
    const responseData = await res.json();
    
    // 将响应数据存入缓存
    setCachedData(url, responseData);
    
    return responseData;
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