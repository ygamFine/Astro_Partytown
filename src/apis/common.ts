// 统一复用轻客户端的 HTTP 能力，避免重复请求代码
import { STRAPI_STATIC_URL, STRAPI_TOKEN, fetchJson, fetchAllPaginated } from '@lib/strapiClient.js';
// 使用菜单工具函数
import { buildMenuTree, extractUrl } from '@utils/tools.js';

// 验证环境变量
if (!STRAPI_STATIC_URL || !STRAPI_TOKEN) {
  throw new Error('缺少必要的 Strapi 环境变量配置');
}

/**
 * 获取网站配置信息
 */
export async function getSiteConfiguration(locale = 'en') {
  try {
    const data = await fetchJson(`${STRAPI_STATIC_URL}/api/site-configuration?locale=${locale}&populate=all`);

    // 转换为标准格式，支持国际化字段
    const siteConfiguration = data.data || {};

    return siteConfiguration;

  } catch (error) {
    return []
  }
}

/**
 * 获取网站国际化信息
 */
export async function getSupportedLanguages() {
  try {
    const data = await fetchJson(`${STRAPI_STATIC_URL}/api/huazhi-translation-plugin/language-settings`);
    // 转换为标准格式，支持国际化字段
    const apiData = data.data
    const locales = apiData?.languageSettings?.map((item: any) => {item.configValue = apiData?.siteNavigationType.configValue; return item}) || [];

    return locales;

  } catch (error) {
    return []
  }
}

/**
 * 获取菜单数据 (SSG模式，构建时调用)
 */
export async function getMenus(locale = 'en') {
  try {
    const data = await fetchJson(`${STRAPI_STATIC_URL}/api/menu-manages?locale=${locale}&populate=all&sort=sort:ASC`);
    
    // 转换为标准格式，支持国际化字段
    const flatMenus = data.data?.map((item: any) => ({
      id: item.id,
      name: item.title,
      path: item.link,
      locale: item.locale,
      publishedAt: item.publishedAt,
      parent: item.parent?.id || null, // 父级菜单ID
      sort: item.sort || 0,
      // 移除原有的children字段，由工具函数重新构建
    })) || [];

    // 使用工具函数构建树形结构
    const treeMenus = buildMenuTree(flatMenus, 'parent', 'id', 'children');
    
    return treeMenus;

  } catch (error) {
    return [];
  }
}

/**
 * 获取产品列表以及详情
 */
export async function getProducts(locale = 'en', slugOrId?: string | number) {
  try {
    // 如果没有传入 slugOrId，则获取产品列表
    if (slugOrId === undefined) {
      const json = await fetchJson(`${STRAPI_STATIC_URL}/api/product-manages?locale=${locale}&populate=all`);
      
      // 处理所有产品的图片，使用缓存的图片
      const products = json.data?.map((item: any) => ({
        ...item,
        image: extractUrl(item.picture, true) || {
          url: '/images/placeholder.webp',
          name: 'placeholder',
        },
      })) || [];

      return products;
    }
    
    // 仅当传入的是 number 类型时才按 ID 查询；字符串一律按 slug 查询（即使是纯数字字符串）
    const isNumericId = (typeof slugOrId === 'number');
    const url = isNumericId && `${STRAPI_STATIC_URL}/api/product-manages/${slugOrId}?locale=${locale}&populate=all`
    
    const data = await fetchJson(url);

    // 适配两种响应：集合查询或单条查询
    const item = Array.isArray(data?.data) ? data.data[0] : data?.data;
    if (!item) {
      return null;
    }

    return {
      ...item,
      image: extractUrl(item.picture, true) || [],
    };

  } catch (error) {
    // 如果API调用失败，返回空数组（列表）或null（详情）
    return slugOrId === undefined ? [] : null;
  }
}
/**
 * 根据分类 slug 获取数据列表
 */
export async function getByCategory(locale = 'en', slug: string, model: string) {
  try {
    if(!model) {
      console.warn('model is required');
      return [];
    }
    
    // 构建基础URL
    const baseUrls: any = {
      product: `/api/product-manages`,
      news: `/api/news`,
      case: `/api/cases`,
    }
    
    if (!baseUrls[model]) {
      console.warn('model is not supported');
      return [];
    }
    
    // 如果有slug，添加分类过滤条件；否则获取所有数据
    const filterParams = slug 
      ? `&filters[${model === 'product' ? 'product_category' : 'category'}][url_slug][$eq]=${slug}`
      : '';
    
    const url = `${STRAPI_STATIC_URL}${baseUrls[model]}?locale=${locale}&populate=all${filterParams}`;
    const json = await fetchJson(url);
    // 处理所有产品的图片，使用缓存的图片
    const datas = json.data?.map((item: any) => ({
      ...item,
      image: extractUrl(item.picture, true) || {
        url: '/images/placeholder.webp',
        name: 'placeholder',
      },
    })) || [];

    return datas;
  } catch (error) {
    console.error(`获取${model}数据失败:`, error);
    return [];
  }
}
/**
 * 获取新闻列表以及详情
 */
export async function getNews(locale = 'en', slugOrId?: string | number) {
  try {
    // 如果没有传入 slugOrId，则获取新闻列表
    if (slugOrId === undefined) {
      const json = await fetchJson(`${STRAPI_STATIC_URL}/api/news?locale=${locale}&populate=all`);

      // 处理所有新闻的图片，使用缓存的图片
      const news = json.data?.map((item: any) => ({
        ...item,
        image: extractUrl(item.picture, true) || {
          url: '/images/placeholder.webp',
          name: 'placeholder',
        },
      }));

      return news;
    }
    
    // 仅当传入的是 number 类型时才按 ID 查询；字符串一律按 slug 查询（即使是纯数字字符串）
    const isNumericId = (typeof slugOrId === 'number');
    const url = isNumericId
      ? `${STRAPI_STATIC_URL}/api/news/${slugOrId}?locale=${locale}&populate=all`
      : `${STRAPI_STATIC_URL}/api/news?filters[url_slug][$eq]=${slugOrId}&locale=${locale}&populate=all`;
    
    const data = await fetchJson(url);

    // 适配两种响应：集合查询或单条查询
    const item = Array.isArray(data?.data) ? data.data[0] : data?.data;
    if (!item) {
      return null;
    }

    return {
      ...item,
      image: extractUrl(item.picture, true) || {
        url: '/images/placeholder.webp',
        name: 'placeholder',
      },
    };

  } catch (error) {
    // 如果API调用失败，返回空数组（列表）或null（详情）
    return slugOrId === undefined ? [] : null;
  }
}

/**
 * 获取案例列表以及详情
 */
export async function getCases(locale = 'en', slugOrId?: string | number) {
  try {
    // 如果没有传入 slugOrId，则获取案例列表
    if (slugOrId === undefined) {
      const baseUrl = `${STRAPI_STATIC_URL}/api/cases?locale=${locale}&populate=all`;
      const json = await fetchJson(`${baseUrl}&pagination[page]=${1}&pagination[pageSize]=${24}`);

      // 处理所有新闻的图片，使用缓存的图片
      const cases = json.data?.map((item: any) => ({
        ...item,
        image: extractUrl(item.picture, true) || {
          url: '/images/placeholder.webp',
          name: 'placeholder',
        },
      }));

      return cases;
    }
    
    // 仅当传入的是 number 类型时才按 ID 查询；字符串一律按 slug 查询（即使是纯数字字符串）
    const isNumericId = (typeof slugOrId === 'number');
    const url = isNumericId
      ? `${STRAPI_STATIC_URL}/api/cases/${slugOrId}?locale=${locale}&populate=all`
      : `${STRAPI_STATIC_URL}/api/cases?filters[url_slug][$eq]=${slugOrId}&locale=${locale}&populate=all`;
    
    const data = await fetchJson(url);

    // 适配两种响应：集合查询或单条查询
    const item = Array.isArray(data?.data) ? data.data[0] : data?.data;
    if (!item) {
      return null;
    }

    return {
      ...item,
      image: extractUrl(item.picture, true) || {
        url: '/images/placeholder.webp',
        name: 'placeholder',
      },
    };

  } catch (error) {
    // 如果API调用失败，返回空数组（列表）或null（详情）
    return slugOrId === undefined ? [] : null;
  }
}