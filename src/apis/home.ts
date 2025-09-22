// 统一复用轻客户端的 HTTP 能力，避免重复请求代码
import { PUBLIC_API_URL, STRAPI_TOKEN, fetchJson } from './apiClient.js';
import { extractUrl, getFirstImage } from '@utils/tools';

// 验证环境变量
if (!PUBLIC_API_URL || !STRAPI_TOKEN) {
  throw new Error('缺少必要的 Strapi 环境变量配置');
}

/**
 * 获取首页数据
 */
export async function getHomepageContent(lang: string) {
  try {
    const data = await fetchJson(`${PUBLIC_API_URL}/api/homepage-content?populate=all&locale=${lang}`);

    if (!data.data) {
      return null;
    }

    const homepageData = data.data;

    return {
      productShowcase: {
        title: homepageData.product_showcase.title,
        description: homepageData.product_showcase.description,
        products: (homepageData.product_showcase.products && Array.isArray(homepageData.product_showcase.products))
          ? homepageData.product_showcase.products.map((item: any) => {
              return {
                ...item,
                image: extractUrl(item.picture, true),
                url_text: item.url_text,
                bigImage: extractUrl(item.product_big, true),
              }
            })
          : [],
      },
      companyIntroduction: {
        title: homepageData.company_introduction.title,
        introduction: homepageData.company_introduction.introduction,
        fuTitle: homepageData.company_introduction.field_fubiaoti,
        desc: homepageData.company_introduction.field_xiangqing,
        imgBg: getFirstImage(extractUrl(homepageData.company_introduction.field_tupian, true)),
        stats: homepageData.company_introduction.stats,
        buttonText: homepageData.company_introduction.btn_text,
        companyInfo: homepageData.company_introduction.field_youshi?.map((item: any) => {
          return {
            ...item,
            c_num: item.field_description,
            c_title: item.field_biaoti,
            c_unit: item.field_danwei,
          }
        }) || [],

      },
      corporateAdvantages: homepageData.company_advantage.field_youshilist?.map((item: any) => {
        return {
          ...item,
          adv_img: getFirstImage(extractUrl(item.field_tubiao, true) || []),
          adv_title: item.field_biaoti,
          adv_desc: item.field_description,
        }
      }) || [],

      hotRecommendedProducts:{
        title: homepageData.hot_recommended_products.title,
        description: homepageData.hot_recommended_products.description,
        products: homepageData.hot_recommended_products.products?.map((item: any) => {
          return {
            ...item,
            image: getFirstImage(extractUrl(item.picture, true) || []),
          }
        }) || [],
      },
      frontContactUs:{
        title: homepageData.contact_us.title,
        fu_title: homepageData.contact_us.fu_title,
        description: homepageData.contact_us.description,
        buttonText: homepageData.contact_us.button_text,
        buttonUrl: homepageData.contact_us.url,
        panoramaText: homepageData.contact_us.panoramic_title,
        panortitle: homepageData.contact_us.panoramic_introduction,
        contactImgBg: getFirstImage(extractUrl(homepageData.contact_us.panorama_img, true)),
      },
      customerCases:{
        title: homepageData.customer_cases.title,
        description: homepageData.customer_cases.description,
        products: homepageData.customer_cases.products?.map((item: any) => {
          return {
            ...item,
            image: getFirstImage(extractUrl(item.picture, true) || []),
          }
        }) || [],
        caseUrl: homepageData.customer_cases.more_url,
        caseUrlText: homepageData.customer_cases.more_text,
      },

    };

  } catch (error) {
    console.error('获取首页数据失败:', error);
    return null;
  }
}

export async function getMobileBottomMenu(lang: string) {
  try {
    const data = await fetchJson(`${PUBLIC_API_URL}/api/shoujiduandibucaidan?populate=all&locale=${lang}`);
    return data.data;
  } catch (error) {
    console.error('获取移动端底部菜单数据失败:', error);
    return null;
  }
}