/**
 * 案例数据服务层
 * 只使用 Strapi API，无数据时返回空数组
 */

import { getCases as getStrapiCases, getCase as getStrapiCase } from './strapi.js';

/**
 * 获取案例列表
 * @param {string} locale - 语言代码
 * @returns {Array} 案例列表
 */
export async function getCases(locale = 'en') {
  try {
    // 从 Strapi API 获取数据
    const strapiCases = await getStrapiCases(locale);
    
    if (strapiCases && strapiCases.length > 0) {
      // 确保所有案例都有有效的图片字段
      const validatedCases = strapiCases.map(caseItem => ({
        ...caseItem,
        image: caseItem.image || '/images/placeholder.webp',
        title: caseItem.title || '未命名案例'
      }));
      
      console.log(`从 Strapi API 获取到 ${validatedCases.length} 个案例`);
      return validatedCases;
    }
  } catch (error) {
    console.error('Strapi API 获取案例列表失败:', error.message);
  }
  
  // 如果 API 失败或返回空数据，返回空数组
  console.log(`语言 ${locale} 没有案例数据，返回空数组`);
  return [];
}

/**
 * 获取单个案例详情
 * @param {string} id - 案例 ID
 * @param {string} locale - 语言代码
 * @returns {Object|null} 案例详情
 */
export async function getCase(id, locale = 'en') {
  try {
    // 从 Strapi API 获取数据
    const strapiCase = await getStrapiCase(id, locale);
    
    if (strapiCase) {
      // 确保案例有有效的图片字段
      const validatedCase = {
        ...strapiCase,
        image: strapiCase.image || '/images/placeholder.webp',
        title: strapiCase.title || '未命名案例'
      };
      
      console.log(`从 Strapi API 获取到案例: ${validatedCase.title}`);
      return validatedCase;
    }
  } catch (error) {
    console.error('Strapi API 获取案例详情失败:', error.message);
  }
  
  // 如果 API 失败或返回空数据，返回 null
  console.log(`语言 ${locale} 没有找到案例 ${id}`);
  return null;
} 