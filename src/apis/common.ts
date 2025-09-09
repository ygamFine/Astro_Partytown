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
 * 获取产品列表 (SSG模式，构建时调用)
 */
export async function getProducts(locale = 'en') {
  // // 兼容：支持 options 对象形式
  // const isOptionsObject = locale && typeof locale === 'object';
  // const options = isOptionsObject ? locale : { locale };
  // const {
  //   locale: optLocale = 'en',
  //   paginate = 'page', // 'page' | 'all'
  //   page = 1,
  //   pageSize = 24,
  // } = options;

  // 构建基础 URL（集合接口）
  const baseUrl = `${STRAPI_STATIC_URL}/api/product-manages?locale=${locale}&populate=all`;
  try {
    // // shaped 模式
    // const json = (paginate === 'all')
    //   ? await fetchAllPaginated(baseUrl)
    //   : 
    const json = await fetchJson(`${baseUrl}&pagination[page]=${1}&pagination[pageSize]=${24}`);
    const products = json.data?.map((item: any) => ({
      ...item,
      image: extractUrl(item.picture, true) || {
        url: '/images/placeholder.webp',
        name: 'placeholder',
      },
    })) || [];

    return products;

  } catch (error) {
    // 如果API调用失败，返回空数组
    return [];
  }
}
/**
 * 获取单个产品详情 (SSG模式，构建时调用)
 */
export async function getProduct(slugOrId: string | number, locale = 'en') {
  console.log('slug创建页面数据', slugOrId, locale);
  try {
    // 只获取指定语言的数据，不回退到其他语言
    // 仅当传入的是 number 类型时才按 ID 查询；字符串一律按 slug 查询（即使是纯数字字符串）
    const isNumericId = (typeof slugOrId === 'number');
    const url = isNumericId
      ? `${STRAPI_STATIC_URL}/api/product-manages/${slugOrId}?locale=${locale}&populate=all`
      : `${STRAPI_STATIC_URL}/api/product-manages?filters[url_slug][$eq]=${slugOrId}&locale=${locale}&populate=all`;
    const data = await fetchJson(url);

    // 适配两种响应：集合查询或单条查询
    const item = Array.isArray(data?.data) ? data.data[0] : data?.data;
    if (!item) {
      return null;
    }

    return {
      ...item,
      image: extractUrl(item.picture, true) || [],
    }

  } catch (error) {
    return null;
  }
}

/**
 * 获取新闻列表 (SSG模式，构建时调用)
 */
export async function getNews(locale = 'en') {
  // // 兼容：支持 options 对象形式
  // const isOptionsObject = locale && typeof locale === 'object';
  // const options = isOptionsObject ? locale : { locale };
  // const {
  //   locale: optLocale = 'en',
  //   paginate = 'page',
  //   page = 1,
  //   pageSize = 24,
  //   mode = 'shaped',
  //   mapImages = true
  // } = options;

  const baseUrl = `${STRAPI_STATIC_URL}/api/news?locale=${locale}&populate=all`;

  try {
    // const json = (paginate === 'all')
    //   ? await fetchAllPaginated(baseUrl)
    //   : 
    const json = await fetchJson(`${baseUrl}&pagination[page]=${1}&pagination[pageSize]=${24}`);

    // 处理所有新闻的图片，使用缓存的图片
    const news = json.data?.map((item: any) => ({
      ...item,
      image: extractUrl(item.picture, true) || {
        url: '/images/placeholder.webp',
        name: 'placeholder',
      },
    }));

    return news;

  } catch (error) {
    // 如果API调用失败，返回空数组
    return [];
  }
}
