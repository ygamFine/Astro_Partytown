/**
 * 新闻数据服务层
 * 优先使用 Strapi API，失败时返回空数组
 */

import { getNews as getStrapiNews, getNewsById as getStrapiNewsById } from './strapi.js';

/**
 * 获取新闻列表
 * @param {string} locale - 语言代码
 * @returns {Array} 新闻列表
 */
export async function getNews(locale = 'en') {
  try {
    // 优先尝试从 Strapi API 获取数据
    const strapiNews = await getStrapiNews(locale);

    if (strapiNews && strapiNews.length > 0) {
      // 确保所有新闻都有有效的字段
              const validatedNews = strapiNews.map(news => ({
          ...news,
          image: news.image || null,
          title: news.title || ''
        }));
      
      console.log(`从 Strapi API 获取到 ${validatedNews.length} 条新闻`);
      return validatedNews;
    }
  } catch (error) {
    console.warn('Strapi API 获取新闻列表失败:', error.message);
  }
  
  // 如果 API 失败或返回空数据，返回空数组
  console.log(`语言 ${locale} 没有新闻数据，返回空数组`);
  return [];
}

/**
 * 获取单个新闻详情
 * @param {string} id - 新闻 ID
 * @param {string} locale - 语言代码
 * @returns {Object|null} 新闻详情
 */
export async function getNewsById(id, locale = 'en') {
  try {
    // 优先尝试从 Strapi API 获取数据
    const strapiNews = await getStrapiNewsById(id, locale);
    
    if (strapiNews) {
      // 确保新闻有有效的字段
      const validatedNews = {
        ...strapiNews,
        image: strapiNews.image || '/images/placeholder.webp',
        title: strapiNews.title || '未命名新闻'
      };
      
      console.log(`从 Strapi API 获取到新闻: ${validatedNews.title}`);
      return validatedNews;
    }
  } catch (error) {
    console.warn('Strapi API 获取新闻详情失败:', error.message);
  }
  
  // 如果 API 失败或返回空数据，返回 null
  console.log(`语言 ${locale} 没有找到新闻 ID: ${id}`);
  return null;
} 