// 统一复用轻客户端的 HTTP 能力，避免重复请求代码
import { PUBLIC_API_URL, STRAPI_TOKEN, ITALKIN_API, fetchJson } from './apiClient.ts';
// 使用菜单工具函数
import { buildMenuTree, extractUrl, getFirstImage, deepMerge, flattenParams } from '@utils/tools.js';
import { getMobileBottomMenuIcon } from '@utils/iconUtils.js';
import { MENU_TYPE_MAPPING } from '@config/constant.js';
import { getSupportedLanguages as languageConfig } from '@utils/languageConfig';
import { API_PAGE_SIZE } from '@config/constant.js';
import generateDefaultParams from './presetParams';
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
 * 获取关键词列表
 */
export async function getKeywords(locale = 'en') {
  try {
    const data = await fetchJson(`${PUBLIC_API_URL}/api/huazhi-seo-plugin/keywords/inner-link?locale=${locale}&populate=all&pagination[pageSize]=${API_PAGE_SIZE}`);

    const keywords = data.data || {};
    return keywords;

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
      ? apiData.languageSettings.map((item: any) => { item.configValue = apiData?.siteNavigationType.configValue; return item })
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
    const data = await fetchJson(`${PUBLIC_API_URL}/api/menu-manages?locale=${locale}&populate=all&sort=sort:ASC&pagination[pageSize]=${API_PAGE_SIZE}`);

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
 * 获取分类列表
 * @param locale 语言
 * @param model 模型
 * @param params 参数
 * @param params.fields 字段
 * @param params.populate 填充
 * @param params.queryParams 查询参数
 * @param params.filters 过滤条件
 * @returns 分类列表
 */
export async function getByCategory(locale = 'en', model: string, params?: any) {
  try {
    if (!model) {
      console.warn('model is required');
      return [];
    }

    // 构建基础URL
    const baseUrls: any = {
      products: `/api/product-categories`,
      news: `/api/newcategries`,
      case: `/api/case-categories`,
    }

    if (!baseUrls[model]) {
      console.warn('model is not supported');
      return [];
    }

    const defaultParams: any = generateDefaultParams(locale);
    const mergedParams = deepMerge(defaultParams, params);
    const flattenedParams = flattenParams(mergedParams);
    const searchParams = new URLSearchParams(flattenedParams);
    const url = `${PUBLIC_API_URL}${baseUrls[model]}?${searchParams}`;
    const data = await fetchJson(url);
    return data.data;
  } catch (error) {
    console.error(`获取${model}数据失败:`, error);
    return [];
  }
}

/**
 * 获取分类列表以及详情
 * @param locale 语言
 * @param model 模型
 * @param params 参数
 * @param params.fields 字段
 * @param params.populate 填充
 * @param params.queryParams 查询参数
 * @param params.filters 过滤条件
 * @returns 分类列表以及详情
 */

export async function getByCenterData(locale = 'en', model: string, params?: any) {
  try {
    // 构建基础URL
    const baseUrls: any = {
      products: `/api/product-manages`,
      news: `/api/news`,
      case: `/api/cases`,
      about: `/api/about-uses`,
      singlepage: `/api/singlepages`,
    }
    if (!baseUrls[model]) {
      console.warn('model is not supported');
      return [];
    }
    const isLoadImg = params?.isLoadImg || false;
    const defaultParams: any = generateDefaultParams(locale, isLoadImg);
    const mergedParams = deepMerge(defaultParams, params);
    const flattenedParams = flattenParams(mergedParams);
    const searchParams = new URLSearchParams(flattenedParams);
    const url = `${PUBLIC_API_URL}${baseUrls[model]}?${searchParams}`;
    const json = await fetchJson(url);
    if (isLoadImg) {
      json.data = json.data.map((item: any) => ({
        ...item,
        image: extractUrl(item.picture, true)
      }))
      return json.data;
    }
    return json.data;
  } catch (error) {
    console.error('出现错误', error)
    return [];
  }
}

/**
 * 获取关于我们列表
 */
export async function getAbout(locale = 'en') {
  try {
    const data = await fetchJson(`${PUBLIC_API_URL}/api/about-uses?locale=${locale}&populate=all&pagination[pageSize]=${API_PAGE_SIZE}`);
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
 * 获取单页面列表
 */
export async function getSinglepages(locale = 'en') {
  try {
    const data = await fetchJson(`${PUBLIC_API_URL}/api/singlepages?locale=${locale}&populate=all&pagination[pageSize]=${API_PAGE_SIZE}`);
    return data.data;
  } catch (error) {
    return null;
  }
}

/**
 * 获取联系方式侧边栏
 */
export async function getContactSidebar(locale = 'en') {
  try {
    const data = await fetchJson(`${PUBLIC_API_URL}/api/sidebar?locale=${locale}&populate=all`);
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
        icon: item.icon ? (getFirstImage(extractUrl(item.icon, true) || []) || { url: getMobileBottomMenuIcon(item), name: item.field_liebiao }) : { url: getMobileBottomMenuIcon(item), name: item.field_liebiao },
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

/**
 * 获取询盘表单
 */
export async function getItalkinForm(companyId: string | number, siteId: string | number) {
  try {
    const language = await languageConfig();
    var raw = JSON.stringify({
      companyId,
      siteId,
      "platform": "website",
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

// 简写封装：提交询盘
export async function submitInquiry(visitorId: string | number, payload: any) {
  try {
    const vid = encodeURIComponent(String(visitorId ?? ''));
    if (!vid) throw new Error('Missing visitorId');
    const res = await fetch(`${ITALKIN_API}/biz/inquiry/${vid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
/**
 * 获取公司信息以及网站信息（合并版：各取第一条）
 */
export async function getCompaniesSite(locale = 'en') {
  try {
    const [companiesRes, websitesRes] = await Promise.all([
      fetchJson(`${PUBLIC_API_URL}/api/companies?populate=all&locale=${locale}`),
      fetchJson(`${PUBLIC_API_URL}/api/websites?populate=all&locale=${locale}`)
    ]);

    const company = Array.isArray(companiesRes?.data) && companiesRes.data.length > 0 ? companiesRes.data[0] : null;
    const website = Array.isArray(websitesRes?.data) && websitesRes.data.length > 0 ? websitesRes.data[0] : null;
    return { company, website };
  } catch (error) {
    return { company: null, website: null };
  }
}