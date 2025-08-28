/**
 * 首页API数据获取模块
 * 专门处理首页相关的数据获取和处理逻辑
 */

import { STRAPI_STATIC_URL_NEW, fetchJson } from './strapiClient.js';

/**
 * 获取首页数据 (SSG模式，构建时调用)
 * 从用户提供的API获取完整的首页内容数据
 *
 * @returns {Promise<Object|null>} 首页数据对象或null（如果获取失败）
 */
export async function getHomepageContent() {
  try {
    const apiUrl = `${STRAPI_STATIC_URL_NEW}/api/homepage-content?populate=all`;
    const data = await fetchJson(apiUrl, { includeAuth: true, useNewToken: true });

    if (!data.data) {
      // 首页数据为空
      return null;
    }

    // 提取并处理首页数据
    const homepageData = data.data;

    return {
      // 产品展示区域数据
      productShowcase: {
        title: homepageData?.product_showcase?.title ?? '',
        description: homepageData?.product_showcase?.description ?? ''
      },

      // 公司介绍数据
      companyIntroduction: {
        title: homepageData?.company_introduction?.title ?? '',
        introduction: homepageData?.company_introduction?.introduction ?? '',
        stats: {
          incorporation: homepageData?.company_introduction?.incorporation ?? '',
          floorSpace: homepageData?.company_introduction?.floorSpace ?? '',
          exportingCountry: homepageData?.company_introduction?.exportingCountry ?? ''
        },
        buttonText: homepageData?.company_introduction?.button_text ?? ''
      },

      // 热门推荐产品数据
      hotRecommendedProducts: {
        title: homepageData?.hot_recommended_products?.title ?? '',
        description: homepageData?.hot_recommended_products?.description ?? ''
      },

      // 联系我们/客户需求数据
      contactUs: {
        title: homepageData?.contact_us?.title ?? '',
        description: homepageData?.contact_us?.description ?? '',
        buttonText: homepageData?.contact_us?.button_text ?? '',
        panoramicTitle: homepageData?.contact_us?.panoramic_title ?? '',
        panoramicIntroduction: homepageData?.contact_us?.panoramic_introduction ?? '',
        panoramicUrl: homepageData?.contact_us?.panoramic_url ?? null
      },

      // 客户案例数据
      customerCases: homepageData.customer_cases || null,

      // 新闻中心数据
      newsCenter: homepageData.news_center || null,

      // 首页页脚数据
      homepageFooter: homepageData.homepage_footer || null
    };

  } catch (error) {
    // 获取首页数据失败
    return null;
  }
}

/**
 * 获取首页Banner数据
 * 封装 getBannerData 方法用于获取首页专用banner
 *
 * @returns {Promise<Array>} Banner数据数组
 */
export async function getHomepageBannerData() {
  try {
    // 这里需要导入 getBannerData，但为了避免循环依赖，我们直接在这里实现
    const { getBannerData } = await import('./strapi.js');
    return await getBannerData('homepage');
  } catch (error) {
    // 获取首页Banner数据失败
    return [];
  }
}

/**
 * 获取所有首页相关数据
 * 统一接口，同时获取首页内容和Banner数据
 *
 * @returns {Promise<Object>} 包含首页数据和Banner数据的对象
 */
export async function getAllHomepageData() {
  try {
    const [homepageData, bannerData] = await Promise.all([
      getHomepageContent(),
      getHomepageBannerData()
    ]);

    return {
      homepageData,
      bannerData
    };
  } catch (error) {
    // 获取所有首页数据失败
    return {
      homepageData: null,
      bannerData: []
    };
  }
}
