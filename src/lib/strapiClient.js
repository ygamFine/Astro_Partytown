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
  const res = await fetch(url, { headers: buildHeaders(includeAuth, useNewToken) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return res.json();
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

export async function getProducts(locale) {
  const endpoint = `${STRAPI_STATIC_URL}/api/products?locale=${encodeURIComponent(locale)}&populate=*`;
  return fetchAllPaginated(endpoint);
}

export async function getNews(locale) {
  const endpoint = `${STRAPI_STATIC_URL}/api/news?locale=${encodeURIComponent(locale)}&populate=*`;
  return fetchAllPaginated(endpoint);
}

export async function getCases(locale) {
  const endpoint = `${STRAPI_STATIC_URL}/api/case?locale=${encodeURIComponent(locale)}&populate=*`;
  return fetchAllPaginated(endpoint);
}

// BannerSetting 特殊：按你的要求使用独立地址，且无需鉴权
export async function getBannerSetting() {
  const url = `${STRAPI_STATIC_URL_NEW}/api/banner-setting?populate[field_shouyebanner][populate][field_tupian][populate]=*`;
  try {
    // 若新端需要 Token，则改为 includeAuth: true, useNewToken: true
    return await fetchJson(url, { includeAuth: !!STRAPI_TOKEN_NEW, useNewToken: true });
  } catch {
    return null;
  }
}


