// 统一的 Strapi HTTP 客户端（构建期/运行期均可用，纯 fetch + env）

import { config } from 'dotenv';
config();

export const STRAPI_STATIC_URL = process.env.STRAPI_STATIC_URL;
export const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
export const STRAPI_STATIC_URL_NEW = process.env.STRAPI_STATIC_URL_NEW;
export const STRAPI_TOKEN_NEW = process.env.STRAPI_API_TOKEN_NEW;

function buildHeaders(includeAuth = true, useNewToken = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = useNewToken ? STRAPI_TOKEN_NEW : STRAPI_TOKEN;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchJson(url, { includeAuth = true, useNewToken = false } = {}) {
  try {
    const res = await fetch(url, { 
      headers: buildHeaders(includeAuth, useNewToken),
      timeout: 30000, // 30秒超时
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
    return res.json();
  } catch (error) {
    console.error(`[Strapi] 网络请求失败: ${url}`, error.message);
    // 在构建环境下，网络请求失败是常见的，不应该中断构建
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.warn(`[Strapi] 构建环境网络请求失败，返回空数据: ${url}`);
      return { data: null };
    }
    throw error;
  }
}

// 通用分页获取，返回 { data: [] }
export async function fetchAllPaginated(endpoint) {
  let page = 1;
  const pageSize = 100;
  let hasMore = true;
  const merged = { data: [] };
  while (hasMore) {
    const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    const json = await fetchJson(url, { includeAuth: true }).catch(() => null);
    if (!json) break;
    const dataArr = Array.isArray(json?.data) ? json.data : [];
    merged.data.push(...dataArr);
    const meta = json?.meta?.pagination;
    hasMore = meta && meta.page && meta.pageCount ? meta.page < meta.pageCount : false;
    page += 1;
  }
  return merged;
}

// 保留底层 HTTP 工具与环境变量导出；业务层 Banner 使用 src/lib/strapi.js 的 getBannerData()


