/**
 * 通用图片处理工具
 * 用于处理Strapi图片映射和本地缓存
 */

import { generateImageHash } from '../utils/hashUtils.js';

// 加载图片映射文件
export async function loadImageMapping() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const mappingPath = path.join(process.cwd(), 'src/data/strapi-image-mapping.json');
    const mappingData = await fs.readFile(mappingPath, 'utf8');
    return JSON.parse(mappingData);
  } catch (error) {
    console.warn('无法加载图片映射文件:', error.message);
    return { strapiImages: [] };
  }
}

// 处理单个图片
export function processImage(imageData, imageMapping = { strapiImages: [] }) {
  if (!imageData) return '/images/placeholder.webp';
  
  // 如果已经是本地缓存路径，直接返回
  if (typeof imageData === 'string' && imageData.startsWith('/images/strapi/')) {
    return imageData;
  }
  
  if (Array.isArray(imageData)) {
    // 如果是数组，找到第一个有效的图片
    const processedImages = imageData
      .map(img => processSingleImage(img, imageMapping))
      .filter(img => img && img !== '/images/placeholder.webp');
    
    return processedImages.length > 0 ? processedImages[0] : '/images/placeholder.webp';
  }
  
  return processSingleImage(imageData, imageMapping);
}

// 处理单个图片
function processSingleImage(img, imageMapping) {
  if (!img) return null;
  
  if (typeof img === 'string') {
    // 如果是字符串URL，尝试在缓存中找到对应的本地文件
    if (img.startsWith('http')) {
      const urlHash = generateImageHash(img);
      const cachedImage = imageMapping.strapiImages?.find(cached => 
        cached.includes(urlHash) || cached.includes(img.split('/').pop())
      );
      return cachedImage || img;
    }
    
    // 如果是本地路径且格式正确，返回原路径
    if (img.match(/\.(jpe?g|png|webp|gif|svg|avif|tiff?)$/i)) {
      return img;
    }
  } else if (img && typeof img === 'object' && img.url) {
    // 如果是图片对象，提取URL并映射到本地缓存
    const originalUrl = img.url;
    if (originalUrl.startsWith('/uploads/')) {
      // 这是Strapi的本地图片，尝试在缓存中找到对应的文件
      const fileName = originalUrl.split('/').pop();
      
      // 尝试多种匹配方式
      const cachedImage = imageMapping.strapiImages?.find(cached => {
        // 1. 直接匹配文件名
        if (cached.includes(fileName)) return true;
        
        // 2. 匹配hash
        if (img.hash && cached.includes(img.hash)) return true;
        
        // 3. Base64编码匹配
        try {
          const encodedName = Buffer.from(fileName).toString('base64');
          if (cached.includes(encodedName)) return true;
          // 处理Base64填充字符
          const encodedNameNoPadding = encodedName.replace(/=+$/, '');
          if (cached.includes(encodedNameNoPadding)) return true;
        } catch (e) {}
        
        // 4. Base64解码匹配
        try {
          const decodedName = Buffer.from(fileName, 'base64').toString();
          if (cached.includes(decodedName)) return true;
        } catch (e) {}
        
        return false;
      });
      
      return cachedImage || originalUrl;
    }
    return originalUrl;
  }
  
  return null;
}

// 批量处理图片数组
export function processImages(images, imageMapping) {
  if (!images || !Array.isArray(images)) return [];
  
  return images
    .map(img => processImage(img, imageMapping))
    .filter(img => img && img !== '/images/placeholder.webp');
} 