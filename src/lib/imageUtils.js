/**
 * 通用图片处理工具
 * 整合了 Strapi 图片映射和本地缓存处理逻辑
 * 可以被任何需要图片处理功能的文件使用
 */

import { generateImageHash } from '../utils/hashUtils.js';

/**
 * 加载图片映射文件的通用函数
 * 如果文件不存在会自动创建默认映射文件
 */
export async function loadImageMappingWithCreate() {
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

/**
 * 加载图片映射文件的别名函数（向后兼容）
 * 与 loadImageMappingWithCreate 功能相同
 */
export const loadImageMapping = loadImageMappingWithCreate;




/**
 * 统一的图片处理函数 - 用于替换重复的图片处理逻辑
 * 支持字符串URL、图片对象、数组等多种输入格式
 * @param {string|object|array} img - 图片数据
 * @param {object} imageMapping - 图片映射数据
 * @returns {string|null} 处理后的图片路径或null
 */
export function processImageWithMapping(img, imageMapping) {
  if (typeof img === 'string') {
    // 如果已经是本地缓存路径，直接返回
    if (img.startsWith('/images/strapi/')) {
      return img;
    }
    // 如果是外部URL，尝试在缓存中找到对应的本地文件
    if (img.startsWith('http')) {
      const urlHash = generateImageHash(img);
      const cachedImage = imageMapping.strapiImages?.find((cached) => 
        cached.includes(urlHash) || cached.includes(img.split('/').pop())
      );
      return cachedImage || img;
    }
    return img;
  } else if (img && typeof img === 'object' && img.url) {
    // 如果是图片对象，提取URL并映射到本地缓存
    const originalUrl = img.url;
    if (originalUrl.startsWith('/uploads/')) {
      // 这是Strapi的本地图片，尝试在缓存中找到对应的文件
      const fileName = originalUrl.split('/').pop();
      
      // 尝试多种匹配方式
      const cachedImage = imageMapping.strapiImages?.find((cached) => {
        // 1. 直接匹配文件名
        if (cached.includes(fileName)) return true;
        
        // 2. 处理空格到下划线的转换
        const fileNameWithUnderscore = fileName.replace(/\s+/g, '_');
        if (cached.includes(fileNameWithUnderscore)) return true;
        
        // 3. 处理下划线到空格的转换
        const fileNameWithSpace = fileName.replace(/_/g, ' ');
        if (cached.includes(fileNameWithSpace)) return true;
        
        // 4. 匹配hash
        if (img.hash && cached.includes(img.hash)) return true;
        
        // 5. Base64编码匹配
        try {
          const encodedName = Buffer.from(fileName).toString('base64');
          if (cached.includes(encodedName)) return true;
          // 处理Base64填充字符
          const encodedNameNoPadding = encodedName.replace(/=+$/, '');
          if (cached.includes(encodedNameNoPadding)) return true;
        } catch (e) {}
        
        // 6. Base64解码匹配
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

/**
 * 处理图片数组
 * @param {array} images - 图片数组
 * @param {object} imageMapping - 图片映射数据
 * @param {boolean} mapImages - 是否启用图片映射
 * @returns {array} 处理后的图片数组
 */
export function processImageArray(images, imageMapping, mapImages = true) {
  if (!images || !Array.isArray(images)) {
    return ['/images/placeholder.webp'];
  }
  
  if (mapImages) {
    const processedImages = images
      .map(img => processImageWithMapping(img, imageMapping))
      .filter(img => img !== null);
    
    return processedImages.length > 0 ? processedImages : ['/images/placeholder.webp'];
  }
  
  return images;
}

/**
 * 处理单个图片，返回默认占位符
 * @param {string|object} image - 图片数据
 * @param {object} imageMapping - 图片映射数据
 * @param {boolean} mapImages - 是否启用图片映射
 * @returns {string} 处理后的图片路径
 */
export function processSingleImage(image, imageMapping, mapImages = true) {
  if (!image) {
    return '/images/placeholder.webp';
  }
  
  if (mapImages) {
    const processedImage = processImageWithMapping(image, imageMapping);
    return processedImage || '/images/placeholder.webp';
  }
  
  // 如果不启用映射，直接处理原始数据
  if (typeof image === 'string') {
    return image;
  } else if (image && typeof image === 'object' && image.url) {
    return image.url;
  }
  
  return '/images/placeholder.webp';
}

/**
 * 批量处理数据中的图片字段
 * @param {array} dataArray - 数据数组
 * @param {string} imageField - 图片字段名
 * @param {object} imageMapping - 图片映射数据
 * @param {boolean} mapImages - 是否启用图片映射
 * @returns {array} 处理后的数据数组
 */
export function processDataImages(dataArray, imageField, imageMapping, mapImages = true) {
  if (!dataArray || !Array.isArray(dataArray)) {
    return [];
  }
  
  return dataArray.map(item => {
    const processedItem = { ...item };
    
    if (item[imageField]) {
      if (Array.isArray(item[imageField])) {
        processedItem[imageField] = processImageArray(item[imageField], imageMapping, mapImages);
      } else {
        processedItem[imageField] = processSingleImage(item[imageField], imageMapping, mapImages);
      }
    }
    
    return processedItem;
  });
}
