// 统一复用轻客户端的 HTTP 能力，避免重复请求代码
import { STRAPI_STATIC_URL, STRAPI_TOKEN, fetchJson } from '@lib/strapiClient.js';
// 使用菜单工具函数
import { buildMenuTree } from '@utils/tools.js';

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