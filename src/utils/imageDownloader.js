/**
 * 图片下载工具 - 用于从 Strapi 下载图片到本地
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
import { config } from 'dotenv';
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 图片缓存目录
const IMAGE_CACHE_DIR = process.env.IMAGE_CACHE_DIR || 'public/images/strapi';

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * 从 URL 下载图片
 * @param {string} url - 图片 URL
 * @param {string} filename - 文件名
 * @returns {Promise<string>} 本地文件路径
 */
async function downloadImage(url, filename) {
  if (!url || url.startsWith('/')) {
    return url; // 已经是本地路径
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to download image: ${url}`);
      return '/images/placeholder.webp';
    }

    const buffer = await response.arrayBuffer();
    const localPath = path.join(IMAGE_CACHE_DIR, filename);
    
    await ensureDir(path.dirname(localPath));
    await fs.writeFile(localPath, Buffer.from(buffer));
    
    console.log(`Downloaded: ${url} -> ${localPath}`);
    return `/${path.relative('public', localPath)}`;
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error.message);
    return '/images/placeholder.webp';
  }
}

/**
 * 处理产品图片数组
 * @param {Array} images - 图片数组
 * @returns {Promise<Array>} 处理后的图片路径数组
 */
export async function processProductImages(images) {
  if (!images || !Array.isArray(images)) {
    return ['/images/placeholder.webp'];
  }

  const processedImages = [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    if (typeof image === 'string' && image.trim()) {
      const filename = `product_${Date.now()}_${i}.webp`;
      const localPath = await downloadImage(image, filename);
      processedImages.push(localPath);
    }
  }

  return processedImages.length > 0 ? processedImages : ['/images/placeholder.webp'];
}

/**
 * 处理单个图片
 * @param {string} image - 图片 URL
 * @returns {Promise<string>} 处理后的图片路径
 */
export async function processSingleImage(image) {
  if (!image || typeof image !== 'string' || !image.trim()) {
    return '/images/placeholder.webp';
  }

  const filename = `single_${Date.now()}.webp`;
  return await downloadImage(image, filename);
}

/**
 * 批量下载图片
 * @param {Array} imageUrls - 图片 URL 数组
 * @returns {Promise<Array>} 本地文件路径数组
 */
export async function batchDownloadImages(imageUrls) {
  if (!Array.isArray(imageUrls)) {
    return [];
  }

  const results = [];
  for (const url of imageUrls) {
    if (url && typeof url === 'string') {
      const filename = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;
      const localPath = await downloadImage(url, filename);
      results.push(localPath);
    }
  }

  return results;
} 