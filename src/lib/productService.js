/**
 * 产品数据服务层
 * 只使用 Strapi API，无数据时返回空数组
 */

import { getProducts as getStrapiProducts, getProduct as getStrapiProduct } from './strapi.js';

/**
 * 获取产品列表
 * @param {string} locale - 语言代码
 * @returns {Array} 产品列表
 */
export async function getProducts(locale = 'en') {
  try {
    // 从 Strapi API 获取数据
    const strapiProducts = await getStrapiProducts(locale);
    
    if (strapiProducts && strapiProducts.length > 0) {
      // 确保所有产品都有有效的图片字段
      const validatedProducts = strapiProducts.map(product => ({
        ...product,
        image: product.image || '/images/placeholder.webp',
        name: product.name || '未命名产品'
      }));
      
      console.log(`从 Strapi API 获取到 ${validatedProducts.length} 个产品`);
      return validatedProducts;
    }
  } catch (error) {
    console.error('Strapi API 获取产品列表失败:', error.message);
  }
  
  // 如果 API 失败或返回空数据，返回空数组
  console.log(`语言 ${locale} 没有产品数据，返回空数组`);
  return [];
}

/**
 * 获取单个产品详情
 * @param {string} slug - 产品 slug
 * @param {string} locale - 语言代码
 * @returns {Object|null} 产品详情
 */
export async function getProduct(slug, locale = 'en') {
  try {
    // 从 Strapi API 获取数据
    const strapiProduct = await getStrapiProduct(slug, locale);
    
    if (strapiProduct) {
      // 确保产品有有效的图片字段
      const validatedProduct = {
        ...strapiProduct,
        image: strapiProduct.image || '/images/placeholder.webp',
        name: strapiProduct.name || '未命名产品'
      };
      
      console.log(`从 Strapi API 获取到产品: ${validatedProduct.name}`);
      return validatedProduct;
    }
  } catch (error) {
    console.error('Strapi API 获取产品详情失败:', error.message);
  }
  
  // 如果 API 失败或返回空数据，返回 null
  console.log(`语言 ${locale} 没有找到产品 ${slug}`);
  return null;
}

/**
 * 获取产品分类列表
 * @param {string} locale - 语言代码
 * @returns {Array} 分类列表
 */
export async function getProductCategories(locale = 'en') {
  const products = await getProducts(locale);
  const categories = [...new Set(products.map(p => p.category))];
  return categories.filter(Boolean);
}

/**
 * 根据分类获取产品
 * @param {string} category - 产品分类
 * @param {string} locale - 语言代码
 * @returns {Array} 产品列表
 */
export async function getProductsByCategory(category, locale = 'en') {
  const products = await getProducts(locale);
  return products.filter(p => p.category === category);
} 