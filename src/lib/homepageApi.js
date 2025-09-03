/**
 * 首页API数据获取模块
 * 只负责数据获取，图片下载由 download-strapi-images.js 处理
 */

import { STRAPI_STATIC_URL, fetchJson } from './strapiClient.js';
import { loadImageMappingWithCreate } from './imageUtils.js';
import { processImageForDisplay, processImageArrayForDisplay } from './imageProcessor.js';

// 不再需要文件系统操作，图片下载由 download-strapi-images.js 处理

// 图片下载功能已移至 download-strapi-images.js 脚本

/**
 * 递归遍历对象中的所有 url 属性并打印
 */
function findAndPrintUrls(obj, path = '') {
  if (!obj || typeof obj !== 'object') return;
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      findAndPrintUrls(item, `${path}[${index}]`);
    });
    return;
  }
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (value && typeof value === 'object') {
      // 递归处理嵌套对象
      findAndPrintUrls(value, currentPath);
    } else if (typeof value === 'string') {
      // 检查是否是URL
      if (value.startsWith('http') || value.startsWith('/uploads/') || value.startsWith('/assets/')) {
        // 发现URL
      }
    }
  }
}

/**
 * 处理首页图片数据
 */
function processHomepageImages(data, imageMapping) {
  if (!data) return data;
  
  // 扫描所有找到的URL
  findAndPrintUrls(data);
  
  // 如果是数组，递归处理每个元素
  if (Array.isArray(data)) {
    return data.map(item => processHomepageImages(item, imageMapping));
  }
  
  // 如果是对象，递归处理每个属性
  if (typeof data === 'object') {
    const processed = {};
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object') {
        // 处理 .media.url 格式
        if (value.media && value.media.url) {
          const processedImage = processImageForDisplay(value.media.url, imageMapping);
          processed[key] = processedImage;
        }
        // 处理直接包含 url 的图片对象
        else if (value.url) {
          const processedImage = processImageForDisplay(value.url, imageMapping);
          processed[key] = processedImage;
        }
        // 处理图片数组
        else if (Array.isArray(value) && value.length > 0 && value[0] && typeof value[0] === 'object') {
          const firstItem = value[0];
          if (firstItem.media?.url || firstItem.url) {
            const processedImages = processImageArrayForDisplay(value, imageMapping);
            processed[key] = processedImages;
          } else {
            processed[key] = processHomepageImages(value, imageMapping);
          }
        }
        // 递归处理其他对象
        else {
          processed[key] = processHomepageImages(value, imageMapping);
        }
      } else {
        // 处理字符串类型的图片URL
        if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/uploads/'))) {
          const processedImage = processImageForDisplay(value, imageMapping);
          processed[key] = value;
        } else {
          processed[key] = value;
        }
      }
    }
    // console.log('✅ 处理完成，processed对象:', processed);
    return processed;
  }
  
  return data;
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

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();
    const homepageData = data.data;
    
    // 开始处理首页图片数据
    
    // 图片下载由 download-strapi-images.js 脚本处理
    
    // 使用图片映射处理数据中的图片
    const processedHomepageData = processHomepageImages(homepageData, imageMapping);
    
    return {
      // 产品展示区域数据
      productShowcase: {
        title: processedHomepageData?.product_showcase?.title ?? '',
        description: processedHomepageData?.product_showcase?.description ?? '',
        products: processedHomepageData?.product_showcase?.products ?? [],
      },

      // 公司介绍数据
      companyIntroduction: {
        title: processedHomepageData?.company_introduction?.title ?? '',
        introduction: processedHomepageData?.company_introduction?.introduction ?? '',
        stats: {
          incorporation: processedHomepageData?.company_introduction?.incorporation ?? '',
          floorSpace: processedHomepageData?.company_introduction?.floorSpace ?? '',
          exportingCountry: processedHomepageData?.company_introduction?.exportingCountry ?? ''
        },
        buttonText: processedHomepageData?.company_introduction?.button_text ?? ''
      },

      // 热门推荐产品数据
      hotRecommendedProducts: {
        title: processedHomepageData?.hot_recommended_products?.title ?? '',
        description: processedHomepageData?.hot_recommended_products?.description ?? ''
      },

      // 联系我们/客户需求数据
      contactUs: {
        title: processedHomepageData?.contact_us?.title ?? '',
        description: processedHomepageData?.contact_us?.description ?? '',
        buttonText: processedHomepageData?.contact_us?.button_text ?? '',
        panoramicTitle: processedHomepageData?.contact_us?.panoramic_title ?? '',
        panoramicIntroduction: processedHomepageData?.contact_us?.panoramic_introduction ?? '',
        panoramicUrl: processedHomepageData?.contact_us?.panoramic_url ?? null
      },

      // 客户案例数据
      customerCases: processedHomepageData.customer_cases || null,

      // 新闻中心数据
      newsCenter: processedHomepageData.news_center || null,

      // 首页页脚数据
      homepageFooter: processedHomepageData.homepage_footer || null
    };

  } catch (error) {
    console.error('获取首页数据失败:', error);
    return null;
  }
}

/**
 * 获取所有首页相关数据
 */
export async function getAllHomepageData() {
  try {
    // 直接获取原始数据以进行URL扫描
    const data = await fetchJson(`${STRAPI_STATIC_URL}/api/homepage-content?populate=all`);

    if (!data.data) {
      return {
        homepageData: null
      };
    }

    const homepageData = data.data;
    
    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();
    
    console.log('开始处理首页图片数据...');
    
    // 图片下载由 download-strapi-images.js 脚本处理
    console.log('📝 数据获取完成，图片下载由 download-strapi-images.js 脚本处理');
    
    // 使用图片映射处理数据中的图片
    console.log('🔄 开始处理图片数据...');
    const processedHomepageData = processHomepageImages(homepageData, imageMapping);
    // console.log('✅ 处理完成，processed对象:', processedHomepageData);
    return {
      homepageData: processedHomepageData
    };
  } catch (error) {
    console.error('获取首页数据失败:', error);
    return {
      homepageData: null
    };
  }
}
