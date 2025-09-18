// 统一复用轻客户端的 HTTP 能力，避免重复请求代码
import { PUBLIC_API_URL, STRAPI_TOKEN, fetchJson } from './apiClient.js';
import { extractUrl } from '@utils/tools';

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
    // console.log('获取到的首页数据:', homepageData.company_introduction);

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
        stats: homepageData.company_introduction.stats,
        buttonText: homepageData.company_introduction.button_text,
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