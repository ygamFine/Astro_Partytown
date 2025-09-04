// 统一复用轻客户端的 HTTP 能力，避免重复请求代码
import { STRAPI_STATIC_URL, STRAPI_TOKEN, fetchJson } from '@lib/strapiClient.js';
import { extractUrl } from '@utils/tools';

// 验证环境变量
if (!STRAPI_STATIC_URL || !STRAPI_TOKEN) {
  throw new Error('缺少必要的 Strapi 环境变量配置');
}

/**
 * 获取首页数据
 */
export async function getHomepageContent() {
    try {
      const data = await fetchJson(`${STRAPI_STATIC_URL}/api/homepage-content?populate=all`);
  
      if (!data.data) {
        return null;
      }
  
      const homepageData = data.data;
      console.log('获取到的首页数据:', homepageData.product_showcase);
      
      
      return {
        productShowcase: {
            title: homepageData.product_showcase.title,
            description: homepageData.product_showcase.description,
            products: homepageData.product_showcase.products?.map((item: any) => {
                return {
                    ...item,
                    image: extractUrl(item, true),
                    url_text: item.url_text,
                }
            }) || [],
        },
      };
  
    } catch (error) {
      console.error('获取首页数据失败:', error);
      return null;
    }
  }