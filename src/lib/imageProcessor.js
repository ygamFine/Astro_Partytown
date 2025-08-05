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
    
    // 检查文件是否存在
    try {
      await fs.access(mappingPath);
      // 文件存在，读取内容
      const mappingData = await fs.readFile(mappingPath, 'utf8');
      return JSON.parse(mappingData);
    } catch (accessError) {
      // 文件不存在，创建默认的映射文件
      console.log('图片映射文件不存在，正在创建默认文件...');
      const defaultMapping = { strapiImages: [] };
      
      // 确保目录存在
      const dirPath = path.dirname(mappingPath);
      try {
        await fs.mkdir(dirPath, { recursive: true });
      } catch (mkdirError) {
        console.warn('无法创建目录:', mkdirError.message);
      }
      
      // 创建默认映射文件
      try {
        await fs.writeFile(mappingPath, JSON.stringify(defaultMapping, null, 2), 'utf8');
        console.log('已创建默认图片映射文件:', mappingPath);
        return defaultMapping;
      } catch (writeError) {
        console.warn('无法创建图片映射文件:', writeError.message);
        return defaultMapping;
      }
    }
  } catch (error) {
    console.warn('无法加载图片映射文件:', error.message);
    return { strapiImages: [] };
  }
}

// 统一的图片处理函数 - 用于替换页面中的重复代码
export function processImageForDisplay(imageData, imageMapping = { strapiImages: [] }) {
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
    // 如果已经是本地缓存路径，直接返回
    if (img.startsWith('/images/strapi/')) {
      return img;
    }
    
    // 如果是字符串URL，尝试在缓存中找到对应的本地文件
    if (img.startsWith('http')) {
      const urlHash = generateImageHash(img);
      const fileName = img.split('/').pop();
      
      // 尝试多种匹配方式
      const cachedImage = imageMapping.strapiImages?.find(cached => {
        // 1. 直接匹配文件名
        if (cached.includes(fileName)) return true;
        
        // 2. 匹配hash
        if (cached.includes(urlHash)) return true;
        
        // 3. 匹配原始URL的base64编码
        try {
          const encodedUrl = Buffer.from(img).toString('base64');
          if (cached.includes(encodedUrl)) return true;
          // 处理Base64填充字符
          const encodedUrlNoPadding = encodedUrl.replace(/=+$/, '');
          if (cached.includes(encodedUrlNoPadding)) return true;
        } catch (e) {}
        
        return false;
      });
      
      return cachedImage || img;
    }
    
    // 如果是本地路径且格式正确，返回原路径
    if (img.match(/\.(jpe?g|png|webp|gif|svg|avif|tiff?)$/i)) {
      return img;
    }
  } else if (img && typeof img === 'object' && img.url) {
    // 如果是图片对象，提取URL并映射到本地缓存
    const originalUrl = img.url;
    
    // 处理完整的Strapi URL
    if (originalUrl.startsWith('http') && originalUrl.includes('/uploads/')) {
      const urlHash = generateImageHash(originalUrl);
      const fileName = originalUrl.split('/').pop();
      
      // 尝试多种匹配方式
      const cachedImage = imageMapping.strapiImages?.find(cached => {
        // 1. 直接匹配文件名
        if (cached.includes(fileName)) return true;
        
        // 2. 匹配hash
        if (cached.includes(urlHash)) return true;
        
        // 3. 匹配原始URL的base64编码
        try {
          const encodedUrl = Buffer.from(originalUrl).toString('base64');
          if (cached.includes(encodedUrl)) return true;
          // 处理Base64填充字符
          const encodedUrlNoPadding = encodedUrl.replace(/=+$/, '');
          if (cached.includes(encodedUrlNoPadding)) return true;
        } catch (e) {}
        
        return false;
      });
      
      return cachedImage || originalUrl;
    }
    
    // 处理相对路径
    if (originalUrl.startsWith('/uploads/')) {
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