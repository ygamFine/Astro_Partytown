// 统一复用轻客户端的 HTTP 能力，避免重复请求代码
import { PUBLIC_API_URL, STRAPI_TOKEN, ITALKIN_API, fetchJson } from './apiClient.ts';
// 使用菜单工具函数
import { buildMenuTree, extractUrl, getFirstImage } from '@utils/tools.js';
import { getMobileBottomMenuIcon } from '@utils/iconUtils.js';
import { MENU_TYPE_MAPPING } from '@config/constant.js';
import { getSupportedLanguages as languageConfig } from '@utils/languageConfig';

// 验证环境变量
if (!PUBLIC_API_URL || !STRAPI_TOKEN) {
  throw new Error('缺少必要的 Strapi 环境变量配置');
}

/**
 * 获取网站配置信息
 */
export async function getSiteConfiguration(locale = 'en') {
  try {
    const data = await fetchJson(`${PUBLIC_API_URL}/api/site-configuration?locale=${locale}&populate=all`);

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
    const data = await fetchJson(`${PUBLIC_API_URL}/api/huazhi-translation-plugin/language-settings`);
    // 转换为标准格式，支持国际化字段
    const apiData = data.data
    const locales = (apiData?.languageSettings && Array.isArray(apiData.languageSettings)) 
      ? apiData.languageSettings.map((item: any) => {item.configValue = apiData?.siteNavigationType.configValue; return item}) 
      : [];

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
    const data = await fetchJson(`${PUBLIC_API_URL}/api/menu-manages?locale=${locale}&populate=all&sort=sort:ASC`);
    
    // 转换为标准格式，支持国际化字段
    const flatMenus = (data.data && Array.isArray(data.data)) 
      ? data.data.map((item: any) => ({
          id: item.id,
          name: item.title,
          path: item.link,
          locale: item.locale,
          publishedAt: item.publishedAt,
          parent: item.parent?.id || null, // 父级菜单ID
          sort: item.sort || 0,
          // 移除原有的children字段，由工具函数重新构建
        }))
      : [];

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
      const json = await fetchJson(`${PUBLIC_API_URL}/api/product-manages?locale=${locale}&populate=all`);
      
      // 处理所有产品的图片，使用缓存的图片
      const products = (json.data && Array.isArray(json.data)) 
        ? json.data.map((item: any) => ({
            ...item,
            image: extractUrl(item.picture, true) || {
              url: '/images/placeholder.webp',
              name: 'placeholder',
            },
          }))
        : [];

      return products;
    }
    
    // 仅当传入的是 number 类型时才按 ID 查询；字符串一律按 slug 查询（即使是纯数字字符串）
    const isNumericId = (typeof slugOrId === 'number');
    const url = isNumericId && `${PUBLIC_API_URL}/api/product-manages/${slugOrId}?locale=${locale}&populate=all`
    if(!url) {
      return null;
    }
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
    
    const url = `${PUBLIC_API_URL}${baseUrls[model]}?locale=${locale}&populate=all${filterParams}`;
    const json = await fetchJson(url);
    // 处理所有产品的图片，使用缓存的图片
    const datas = (json.data && Array.isArray(json.data)) 
      ? json.data.map((item: any) => ({
          ...item,
          image: extractUrl(item.picture, true) || {
            url: '/images/placeholder.webp',
            name: 'placeholder',
          },
        }))
      : [];

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
      const json = await fetchJson(`${PUBLIC_API_URL}/api/news?locale=${locale}&populate=all`);

      // 处理所有新闻的图片，使用缓存的图片
      const news = (json.data && Array.isArray(json.data)) 
        ? json.data.map((item: any) => ({
            ...item,
            image: extractUrl(item.picture, true) || {
              url: '/images/placeholder.webp',
              name: 'placeholder',
            },
          }))
        : [];

      return news;
    }
    
    // 仅当传入的是 number 类型时才按 ID 查询；字符串一律按 slug 查询（即使是纯数字字符串）
    const isNumericId = (typeof slugOrId === 'number');
    const url = isNumericId
      ? `${PUBLIC_API_URL}/api/news/${slugOrId}?locale=${locale}&populate=all`
      : `${PUBLIC_API_URL}/api/news?filters[url_slug][$eq]=${slugOrId}&locale=${locale}&populate=all`;
    
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
      const baseUrl = `${PUBLIC_API_URL}/api/cases?locale=${locale}&populate=all`;
      const json = await fetchJson(`${baseUrl}&pagination[page]=${1}&pagination[pageSize]=${24}`);

      // 处理所有新闻的图片，使用缓存的图片
      const cases = (json.data && Array.isArray(json.data)) 
        ? json.data.map((item: any) => ({
            ...item,
            image: extractUrl(item.picture, true) || {
              url: '/images/placeholder.webp',
              name: 'placeholder',
            },
          }))
        : [];

      return cases;
    }
    
    // 仅当传入的是 number 类型时才按 ID 查询；字符串一律按 slug 查询（即使是纯数字字符串）
    const isNumericId = (typeof slugOrId === 'number');
    const url = isNumericId
      ? `${PUBLIC_API_URL}/api/cases/${slugOrId}?locale=${locale}&populate=all`
      : `${PUBLIC_API_URL}/api/cases?filters[url_slug][$eq]=${slugOrId}&locale=${locale}&populate=all`;
    
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
 * 获取关于我们列表
 */
export async function getAbout(locale = 'en') {
  try {
    const data = await fetchJson(`${PUBLIC_API_URL}/api/about-uses?locale=${locale}&populate=all`);
    return data.data;
  } catch (error) {
    return null;
  }
}

/**
 * 获取联系我们
 */
export async function getContact(locale = 'en') {
  try {
    const data = await fetchJson(`${PUBLIC_API_URL}/api/contact-us?locale=${locale}&populate=all`);
    return data.data;
  } catch (error) {
    return null;
  }
}

/**
 * 获取移动端底部菜单
 */
export async function getMobileBottomMenu(locale = 'en') {
  try {
    const data = await fetchJson(`${PUBLIC_API_URL}/api/shoujiduandibucaidan?locale=${locale}&populate=all`);
    const menuItems = data?.data?.shoujiduandibucaidan;
    const getMenuType = (item: any) => {
      // 优先根据 field_liebiao 字段的唯一标识判断类型
      const fieldLiebiao = item.field_liebiao || '';
      const uniqueId = fieldLiebiao.includes('|') ? fieldLiebiao.split('|')[0].toLowerCase().trim() : fieldLiebiao.toLowerCase().trim();
      const menuType = MENU_TYPE_MAPPING[uniqueId as keyof typeof MENU_TYPE_MAPPING]
      if (menuType) {
        return menuType;
      }
      return uniqueId;
    }
    // 转换为标准格式
    const menus = menuItems && Array.isArray(menuItems) ? menuItems.map((item: any) => {    
      return {
        id: item.id,
        content: item.field_neirong,
        // 链接优先级：field_zidingyilianjie > Inline_address > 默认值
        customLink: item.field_zidingyilianjie || item.Inline_address,
        inlineAddress: item.Inline_address,
        externalLink: item.field_zidingyilianjie,
        // 根据数据结构判断菜单类型，而不是依赖多语言的名称
        type: getMenuType(item),
        // 图标处理：优先使用深层提取的自定义图标，没有则使用field_liebiao对应的字体图标
        icon: item.icon ? (getFirstImage(extractUrl(item.icon, true) || []) || {url: getMobileBottomMenuIcon(item), name: item.field_liebiao}) : {url: getMobileBottomMenuIcon(item), name: item.field_liebiao},
        // 新增：区分是图片图标还是字体图标
        iconType: item.icon ? 'image' : 'font'
      };
    }) : [];
    return menus;
  } catch (error) {
    // dev/构建环境下失败时返回空数组，避免调用处 .map 报错
    return [];
  }
}


export async function getItalkinForm(locale = 'en') {
  try {
    const language = await languageConfig();
    console.log(language)
    var raw = JSON.stringify({
      "companyId":1280,
      "siteId":91,
      "platform":"website",
      "codes": language
   });
    const res = await fetch(`${ITALKIN_API}/biz/form/field/getOnlineAndOfflineFormAndTrans`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
       },
      body: raw
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for `);
    return res.json();
  } catch (error) {
    console.error(error)
    return null;
  }
}