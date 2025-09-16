// 统一的 Strapi HTTP 客户端（构建期/运行期均可用，纯 fetch + env）

import { config } from 'dotenv';
config();

// 类型定义
interface StrapiResponse<T = any> {
  data: T | null;
}

interface RequestHeaders {
  'Content-Type': string;
  'Authorization': string;
  [key: string]: string;
}

export const STRAPI_STATIC_URL: string | undefined = process.env.STRAPI_STATIC_URL;
export const STRAPI_TOKEN: string | undefined = process.env.STRAPI_API_TOKEN;

function buildHeaders(): RequestHeaders {
  const headers: RequestHeaders = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
   };
  return headers;
}

export async function fetchJson<T = any>(url: string): Promise<StrapiResponse<T>> {
  try {
    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    const res = await fetch(url, { 
      headers: buildHeaders(),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
    return res.json();
  } catch (error) {
    // Strapi 网络请求失败
    // 在构建环境下，网络请求失败是常见的，不应该中断构建
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      // 构建环境网络请求失败，返回空数据
      return { data: null };
    }
    throw error;
  }
}