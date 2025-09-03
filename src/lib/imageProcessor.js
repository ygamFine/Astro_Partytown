/**
 * 通用图片处理工具
 * 用于处理Strapi图片映射和本地缓存，支持 Astro Image 组件
 */

import { generateImageHash } from '../utils/hashUtils.js';
import { loadImageMappingWithCreate } from './imageUtils.js';

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
 * 为 Astro Image 组件创建配置对象
 * @param {string} imageData - 图片数据
 * @param {Object} options - 配置选项
 * @returns {Object} Astro Image 配置对象
 */
export function createAstroImageConfig(imageData, options = {}) {
  const {
    alt = '',
    width = 800,
    height = 600,
    loading = 'lazy',
    decoding = 'async',
    fetchpriority = 'auto',
    class: className = '',
    style = '',
    ...rest
  } = options;

  const src = processImageForDisplay(imageData);
  
  return {
    src,
    alt,
    width,
    height,
    loading,
    decoding,
    fetchpriority,
    class: className,
    style,
    ...rest
  };
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

// 从环境变量读取 Strapi 基础地址，用于在未命中本地映射时回退为绝对URL
const STRAPI_STATIC_URL = typeof process !== 'undefined' ? (process.env.STRAPI_STATIC_URL || '') : '';

// 重新导出 loadImageMapping 函数以保持向后兼容性
export { loadImageMappingWithCreate as loadImageMapping } from './imageUtils.js';

// 统一的图片处理函数 - 用于替换页面中的重复代码
export function processImageForDisplay(imageData, imageMapping = { strapiImages: [] }) {
  if (!imageData) return null;
  
  // Strapi 本地化图片统一返回发射后的资源；未命中返回原地址
  if (
    typeof imageData === 'string' && (
      imageData.startsWith('/images/strapi/') ||
      imageData.startsWith('/assets/strapi/') ||
      imageData.startsWith('/src/assets/strapi/') ||
      imageData.startsWith('/assets/')
    )
  ) {
    const file = imageData.split('/').pop();
    if (file) {
      return resolveEmittedUrlSync(file, imageData);
    }
    return imageData;
  }
  
  // 处理 Strapi 相对路径字符串
  if (typeof imageData === 'string' && imageData.startsWith('/uploads/')) {
    const fileName = imageData.split('/').pop();
    const byFile = fileName ? resolveEmittedUrlSync(fileName, null) : null;
    if (byFile) return byFile;
    const hash = generateImageHash(imageData);
    const byHash = resolveEmittedUrlSync(fileName || hash, null);
    return byHash || imageData; // 返回原地址而不是占位符
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

// 专供 astro:assets 的 <Image> / getImage 使用：优先返回“导入的图片对象”，否则返回远程 URL，找不到返回 null
export function processImageForAstro(imageData) {
  if (!imageData) return null;

  if (typeof imageData === 'string') {
    // 本地映射到发射资源（根据文件名或哈希）
    if (
      imageData.startsWith('/images/strapi/') ||
      imageData.startsWith('/assets/strapi/') ||
      imageData.startsWith('/src/assets/strapi/') ||
      imageData.startsWith('/assets/')
    ) {
      const file = imageData.split('/').pop();
      if (file) return resolveEmittedModuleSync(file);
      return null;
    }
    // Strapi 相对路径
    if (imageData.startsWith('/uploads/')) {
      const fileName = imageData.split('/').pop();
      if (fileName) return resolveEmittedModuleSync(fileName);
      const pathHash = generateImageHash(imageData);
      return resolveEmittedModuleSync(pathHash);
    }
    // 远程 URL 直接返回字符串（<Image> 支持远程 URL）
    if (/^https?:\/\//i.test(imageData)) return imageData;
    // 其它本地字符串路径不支持
    return null;
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
    let originalUrl = null;
    
    // 1. 检查 .media.url 格式（Strapi 标准格式）
    if (imageData.media && imageData.media.url) {
      originalUrl = imageData.media.url;
    }
    // 2. 检查直接 .url 格式
    else if (imageData.url) {
      originalUrl = imageData.url;
    }
    
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
  
  // Strapi 本地化图片统一返回发射后的资源；未命中返回原地址
  if (
    typeof imageData === 'string' && (
      imageData.startsWith('/images/strapi/') ||
      imageData.startsWith('/assets/strapi/') ||
      imageData.startsWith('/src/assets/strapi/') ||
      imageData.startsWith('/assets/')
    )
  ) {
    const file = imageData.split('/').pop();
    if (file) return resolveEmittedUrlSync(file, imageData);
    return imageData;
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
    // Strapi 相对路径：直接尝试发射后的 _astro URL，未命中返回原地址
    if (img.startsWith('/uploads/')) {
      const pathHash = generateImageHash(img);
      const fileName = img.split('/').pop();
      const byFile = fileName ? resolveEmittedUrlSync(fileName, null) : null;
      if (byFile) return byFile;
      const byHash = resolveEmittedUrlSync(pathHash, null);
      return byHash || img; // 返回原地址而不是占位符
    }
    // 绝对URL（Strapi 完整地址）：优先尝试发射后的 _astro URL，未命中则返回原URL
    if (img.startsWith('http')) {
      try {
        const { pathname } = new URL(img);
        const pathHash = generateImageHash(pathname);
        const fileName = img.split('/').pop();
        const byFile = fileName ? resolveEmittedUrlSync(fileName, null) : null;
        if (byFile) return byFile;
        const byHash = resolveEmittedUrlSync(pathHash, null);
        return byHash || img; // 如果找不到本地映射，返回原URL而不是占位图片
      } catch {
        return img; // 如果解析失败，返回原URL而不是占位图片
      }
    }
    
    // 如果是本地路径且格式正确，返回原路径
    if (img.match(/\.(jpe?g|png|webp|gif|svg|avif|tiff?)$/i)) {
      return img;
    }
  } else if (img && typeof img === 'object') {
    // 处理图片对象：支持 .media.url 和 .url 格式
    let originalUrl = null;
    
    // 1. 检查 .media.url 格式（Strapi 标准格式）
    if (img.media && img.media.url) {
      originalUrl = img.media.url;
    }
    // 2. 检查直接 .url 格式
    else if (img.url) {
      originalUrl = img.url;
    }
    
    if (originalUrl) {
      if (originalUrl.startsWith('/uploads/')) {
        const fileName = originalUrl.split('/').pop();
        const byFile = fileName ? resolveEmittedUrlSync(fileName, null) : null;
        if (byFile) return byFile;
        const hash = generateImageHash(originalUrl);
        const byHash = resolveEmittedUrlSync(fileName || hash, null);
        return byHash || originalUrl; // 返回原地址而不是占位符
      }
      // 若不是 Strapi 的 uploads 资源，保留原链接（站内非 Strapi 静态图）
      return originalUrl;
    }
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