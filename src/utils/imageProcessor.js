/**
 * 通用图片处理工具
 * 用于处理Strapi图片映射和本地缓存，支持 Astro Image 组件
 */

import { generateImageHash } from '@utils/hashUtils.js';

// 由构建脚本生成的URL映射（指向最终发射到/_astro/...的绝对URL）
let EMITTED_URLS = {};

// 异步加载 EMITTED_URLS
async function loadEmittedUrls() {
  try {
    const module = await import('../data/strapi-image-urls.js');
    EMITTED_URLS = module.STRAPI_IMAGE_URLS || {};
  } catch (error) {
    // 静默处理加载失败
  }
}

// 立即加载
loadEmittedUrls();

/**
 * 检查是否是 Strapi 本地化图片路径
 * @param {string} path - 图片路径
 * @returns {boolean} 是否是 Strapi 本地化路径
 */
function isStrapiLocalPath(path) {
  return typeof path === 'string' && (
    path.startsWith('/images/strapi/') ||
    path.startsWith('/assets/strapi/') ||
    path.startsWith('/src/assets/strapi/') ||
    path.startsWith('/assets/')
  );
}

/**
 * 从图片对象中提取 URL
 * @param {Object} img - 图片对象
 * @returns {string|null} 提取的 URL 或 null
 */
function extractUrlFromImageObject(img) {
  if (!img || typeof img !== 'object') return null;
  
  // 1. 检查 .media.url 格式（Strapi 标准格式）
  if (img.media && img.media.url) {
    return img.media.url;
  }
  // 2. 检查直接 .url 格式
  if (img.url) {
    return img.url;
  }
  
  return null;
}

/**
 * 处理 uploads 路径，尝试映射到本地资源
 * @param {string} uploadsPath - uploads 路径
 * @returns {string} 映射后的路径或原路径
 */
function processUploadsPath(uploadsPath) {
  const fileName = uploadsPath.split('/').pop();
  const byFile = fileName ? resolveEmittedUrlSync(fileName, null) : null;
  if (byFile) return byFile;
  
  const hash = generateImageHash(uploadsPath);
  const byHash = resolveEmittedUrlSync(fileName || hash, null);
  return byHash || uploadsPath; // 返回原地址而不是占位符
}

/**
 * 处理 imageConvert.js 返回的路径，转换为 Astro 兼容的路径
 * @param {string} imageConvertPath - imageConvert.js 返回的路径
 * @returns {string} Astro 兼容的路径
 */
function processImageConvertPath(imageConvertPath) {
  if (!imageConvertPath || typeof imageConvertPath !== 'string') {
    return imageConvertPath;
  }
  
  // 如果是 imageConvert.js 返回的路径格式
  if (imageConvertPath.startsWith('/assets/strapi/')) {
    const fileName = imageConvertPath.split('/').pop();
    
    // 尝试在 EMITTED_URLS 中查找映射
    const emittedUrl = resolveEmittedUrlSync(fileName, null);
    if (emittedUrl) {
      return emittedUrl;
    }
    
    // 如果没有找到映射，返回原路径（imageConvert.js 已经处理过了）
    return imageConvertPath;
  }
  
  return imageConvertPath;
}

/**
 * 通用的路径处理函数，统一处理各种路径类型
 * @param {string} path - 图片路径
 * @param {boolean} forAstro - 是否用于 Astro 组件
 * @returns {string} 处理后的路径
 */
function processPath(path, forAstro = false) {
  if (!path || typeof path !== 'string') {
    return path;
  }
  
  // 处理 Strapi 本地化路径
  if (isStrapiLocalPath(path)) {
    // 优先处理 imageConvert.js 返回的路径
    if (path.startsWith('/assets/strapi/')) {
      if (forAstro) {
        // 对于 Astro，直接提取文件名并查找模块
        const fileName = path.split('/').pop();
        return resolveEmittedModuleSync(fileName);
      } else {
        return processImageConvertPath(path);
      }
    }
    
    // 处理其他本地路径
    const file = path.split('/').pop();
    if (file) {
      return forAstro ? resolveEmittedModuleSync(file) : resolveEmittedUrlSync(file, path);
    }
    return path;
  }
  
  // 处理 uploads 路径
  if (path.startsWith('/uploads/')) {
    if (forAstro) {
      const fileName = path.split('/').pop();
      if (fileName) return resolveEmittedModuleSync(fileName);
      const pathHash = generateImageHash(path);
      return resolveEmittedModuleSync(pathHash);
    } else {
      return processUploadsPath(path);
    }
  }
  
  // 处理远程 URL
  if (path.startsWith('http')) {
    if (forAstro) {
      return path; // Astro 支持远程 URL
    } else {
      try {
        const { pathname } = new URL(path);
        const pathHash = generateImageHash(pathname);
        const fileName = path.split('/').pop();
        const byFile = fileName ? resolveEmittedUrlSync(fileName, null) : null;
        if (byFile) return byFile;
        const byHash = resolveEmittedUrlSync(pathHash, null);
        return byHash || path;
      } catch {
        return path;
      }
    }
  }
  
  return path;
}

function resolveEmittedUrlSync(fileNameOrHash, fallback) {
  const table = EMITTED_URLS;
  if (!table) return fallback;
  
  // 直接查找
  let imageObject = table[fileNameOrHash];
  
  // 如果没有找到，尝试在banner目录中查找
  if (!imageObject) {
    const bannerKey = `banner/${fileNameOrHash}`;
    imageObject = table[bannerKey];
  }
  
  // 如果还是没有找到，尝试查找不带扩展名的版本
  if (!imageObject && fileNameOrHash.includes('.')) {
    const nameWithoutExt = fileNameOrHash.split('.')[0];
    imageObject = table[nameWithoutExt];
  }
  
  // 如果还是没有找到，尝试查找带扩展名的版本
  if (!imageObject && !fileNameOrHash.includes('.')) {
    const withExt = `${fileNameOrHash}.webp`;
    imageObject = table[withExt];
  }
  
  if (!imageObject) return fallback;
  
  // 如果是 Astro 图片对象，返回 src 属性
  if (typeof imageObject === 'object' && imageObject.src) {
    return imageObject.src;
  }
  
  // 如果是字符串，直接返回
  if (typeof imageObject === 'string') {
    return imageObject;
  }
  
  return fallback;
}

// 返回发射映射中的原始模块对象（用于 <Image src={...}> 传入本地导入对象）
function resolveEmittedModuleSync(fileNameOrHash) {
  const table = EMITTED_URLS;
  if (!table) return null;
  const imageObject = table[fileNameOrHash];
  if (!imageObject) return null;
  if (typeof imageObject === 'object' && imageObject.src) return imageObject;
  // 仅当是远程 URL 字符串时可用于 <Image>，否则返回 null
  if (typeof imageObject === 'string' && /^https?:\/\//i.test(imageObject)) return imageObject;
  return null;
}

// 重新导出 loadImageMapping 函数以保持向后兼容性
export { loadImageMappingWithCreate as loadImageMapping } from '@lib/imageUtils.js';

// 统一的图片处理函数 - 用于替换页面中的重复代码
export function processImageForDisplay(imageData, imageMapping = { strapiImages: [] }) {
  if (!imageData) return null;
  
  // 如果是字符串，使用通用路径处理函数
  if (typeof imageData === 'string') {
    return processPath(imageData, false);
  }
  
  // 如果是数组，找到第一个有效的图片
  if (Array.isArray(imageData)) {
    const processedImages = imageData
      .map(img => processSingleImage(img, imageMapping))
      .filter(img => img && img !== '/images/placeholder.webp');
    
    return processedImages.length > 0 ? processedImages[0] : null;
  }
  
  return processSingleImage(imageData, imageMapping);
}

// 专供 astro:assets 的 <Image> / getImage 使用：优先返回“导入的图片对象”，否则返回远程 URL，找不到返回 null
export function processImageForAstro(imageData) {
  if (!imageData) return '/images/placeholder.webp';

  if (typeof imageData === 'string') {
    return processPath(imageData, true);
  }

  if (Array.isArray(imageData)) {
    for (const candidate of imageData) {
      const mod = processImageForAstro(candidate);
      if (mod) return mod;
    }
    return null;
  }

  if (imageData && typeof imageData === 'object') {
    // 兼容传入图片对象：支持 .media.url 和 .url 格式
    const originalUrl = extractUrlFromImageObject(imageData);
    
    if (typeof originalUrl === 'string') return processImageForAstro(originalUrl);
  }

  return null;
}

export function processImagesForAstro(images) {
  if (!images || !Array.isArray(images)) return [];
  return images
    .map(img => processImageForAstro(img))
    .filter(Boolean);
}

// 处理单个图片
export function processImage(imageData, imageMapping = { strapiImages: [] }) {
  if (!imageData) return null;
  
  // 如果是字符串，使用通用路径处理函数
  if (typeof imageData === 'string') {
    return processPath(imageData, false);
  }
  
  if (Array.isArray(imageData)) {
    // 如果是数组，找到第一个有效的图片
    const processedImages = imageData
      .map(img => processSingleImage(img, imageMapping))
      .filter(img => img && img !== '/images/placeholder.webp');
    
    return processedImages.length > 0 ? processedImages[0] : null;
  }
  
  return processSingleImage(imageData, imageMapping);
}

// 处理单个图片
function processSingleImage(img, imageMapping) {
  if (!img) return null;
  
  if (typeof img === 'string') {
    // 兼容逗号分隔的多图字符串，取第一个可用图
    if (img.includes(',')) {
      const candidates = img.split(',').map(s => s.trim()).filter(Boolean);
      for (const candidate of candidates) {
        const resolved = processSingleImage(candidate, imageMapping);
        if (resolved && resolved !== '/images/placeholder.webp') return resolved;
      }
      return null;
    }
    // 使用通用路径处理函数
    return processPath(img, false);
    
    // 如果是本地路径且格式正确，返回原路径
    if (img.match(/\.(jpe?g|png|webp|gif|svg|avif|tiff?)$/i)) {
      return img;
    }
  } else if (img && typeof img === 'object') {
    // 处理图片对象：支持 .media.url 和 .url 格式
    const originalUrl = extractUrlFromImageObject(img);
    
    if (originalUrl) {
      if (originalUrl.startsWith('/uploads/')) {
        return processUploadsPath(originalUrl);
      }
      // 若不是 Strapi 的 uploads 资源，保留原链接（站内非 Strapi 静态图）
      return originalUrl;
    }
  }
  
  return null;
}

// 处理图片数组，使用 processImageForDisplay
export function processImageArrayForDisplay(images, imageMapping) {
  if (!images || !Array.isArray(images)) {
    return [];
  }
  
  const processedImages = images
    .map(img => processImageForDisplay(img, imageMapping))
    .filter(img => img && img !== '/images/placeholder.webp');
  
  return processedImages;
} 