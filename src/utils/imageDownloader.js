/**
 * 图片下载工具 - 在构建时将Strapi图片下载到本地
 */

import fs from 'fs/promises';
import path from 'path';

// 图片缓存目录 - 使用相对路径
const IMAGE_CACHE_DIR = path.join(process.cwd(), 'public/images/strapi');
const STRAPI_STATIC_URL = 'http://47.251.126.80';

/**
 * 确保缓存目录存在
 */
async function ensureCacheDir() {
  try {
    await fs.access(IMAGE_CACHE_DIR);
  } catch {
    await fs.mkdir(IMAGE_CACHE_DIR, { recursive: true });
  }
}

/**
 * 生成图片文件名
 */
function generateImageFileName(originalUrl) {
  const url = new URL(originalUrl, STRAPI_STATIC_URL);
  const pathname = url.pathname;
  const ext = path.extname(pathname) || '.jpg';
  const hash = Buffer.from(pathname).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  return `${hash}${ext}`;
}

/**
 * 下载单个图片（唯一实现）
 */
export async function downloadImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return '/images/placeholder.webp';
  }

  // 如果已经是本地路径，直接返回
  if (imageUrl.startsWith('/images/') || imageUrl.startsWith('./')) {
    return imageUrl;
  }

  // 如果是完整的Strapi URL
  if (imageUrl.startsWith(STRAPI_STATIC_URL)) {
    try {
      await ensureCacheDir();
      
      const fileName = generateImageFileName(imageUrl);
      const localPath = path.join(IMAGE_CACHE_DIR, fileName);
      const publicPath = `/images/strapi/${fileName}`;

      // 检查文件是否已存在
      try {
        await fs.access(localPath);
        return publicPath;
      } catch {
        // 文件不存在，需要下载
      }

      // 下载图片
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.warn(`下载图片失败: ${imageUrl}`);
        return '/images/placeholder.webp';
      }

      const buffer = await response.arrayBuffer();
      await fs.writeFile(localPath, Buffer.from(buffer));
      
      return publicPath;
    } catch (error) {
      console.error(`下载图片出错: ${imageUrl}`, error.message);
      return '/images/placeholder.webp';
    }
  }

  // 如果是相对路径，转换为绝对路径
  if (imageUrl.startsWith('/uploads/')) {
    const fullUrl = `${STRAPI_STATIC_URL}${imageUrl}`;
    return await downloadImage(fullUrl);
  }

  // 其他情况返回占位符
  return '/images/placeholder.webp';
}

/**
 * 批量下载图片
 */
export async function downloadImages(imageUrls) {
  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }

  const downloadPromises = imageUrls.map(url => downloadImage(url));
  const results = await Promise.allSettled(downloadPromises);
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error('下载图片失败:', result.reason);
      return '/images/placeholder.webp';
    }
  });
}

/**
 * 处理产品图片数组
 */
export async function processProductImages(images) {
  if (!images || images.length === 0) {
    return ['/images/placeholder.webp'];
  }

  const processedImages = [];
  
  for (const image of images) {
    if (typeof image === 'string') {
      const localImage = await downloadImage(image);
      processedImages.push(localImage);
    } else if (image && typeof image === 'object' && image.url) {
      const localImage = await downloadImage(image.url);
      processedImages.push(localImage);
    }
  }

  return processedImages.length > 0 ? processedImages : ['/images/placeholder.webp'];
}

/**
 * 处理单个图片
 */
export async function processSingleImage(image) {
  if (!image) {
    return '/images/placeholder.webp';
  }

  if (typeof image === 'string') {
    return await downloadImage(image);
  }

  if (image && typeof image === 'object' && image.url) {
    return await downloadImage(image.url);
  }

  return '/images/placeholder.webp';
} 