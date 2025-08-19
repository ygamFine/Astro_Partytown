/**
 * 通用图片处理工具
 * 用于处理Strapi图片映射和本地缓存，支持 Astro Image 组件
 */

import { generateImageHash } from '../utils/hashUtils.js';

// 由构建脚本生成的URL映射（指向最终发射到/_astro/...的绝对URL）
let EMITTED_URLS = {};
try {
  EMITTED_URLS = (await import('../data/strapi-image-urls.js')).STRAPI_IMAGE_URLS || {};
} catch {}

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
  return table[fileNameOrHash] || fallback;
}

// 从环境变量读取 Strapi 基础地址，用于在未命中本地映射时回退为绝对URL
const STRAPI_STATIC_URL = typeof process !== 'undefined' ? (process.env.STRAPI_STATIC_URL || '') : '';

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

// 统一的图片处理函数 - 用于替换页面中的重复代码
export function processImageForDisplay(imageData, imageMapping = { strapiImages: [] }) {
  if (!imageData) return '/images/placeholder.webp';
  
  // Strapi 本地化图片统一返回发射后的 _astro 资源；未命中直接占位图
  if (typeof imageData === 'string' && (imageData.startsWith('/images/strapi/') || imageData.startsWith('/assets/strapi/'))) {
    const file = imageData.split('/').pop();
    if (file) {
      return resolveEmittedUrlSync(file, '/images/placeholder.webp');
    }
    return '/images/placeholder.webp';
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
  
  // Strapi 本地化图片统一返回发射后的 _astro 资源；未命中直接占位图
  if (typeof imageData === 'string' && (imageData.startsWith('/images/strapi/') || imageData.startsWith('/assets/strapi/'))) {
    const file = imageData.split('/').pop();
    if (file) return resolveEmittedUrlSync(file, '/images/placeholder.webp');
    return '/images/placeholder.webp';
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
    // 兼容逗号分隔的多图字符串，取第一个可用图
    if (img.includes(',')) {
      const candidates = img.split(',').map(s => s.trim()).filter(Boolean);
      for (const candidate of candidates) {
        const resolved = processSingleImage(candidate, imageMapping);
        if (resolved && resolved !== '/images/placeholder.webp') return resolved;
      }
      return '/images/placeholder.webp';
    }
    // Strapi 相对路径：直接尝试发射后的 _astro URL，未命中返回占位图
    if (img.startsWith('/uploads/')) {
      const pathHash = generateImageHash(img);
      const fileName = img.split('/').pop();
      const byFile = fileName ? resolveEmittedUrlSync(fileName, null) : null;
      if (byFile) return byFile;
      const byHash = resolveEmittedUrlSync(pathHash, null);
      return byHash || '/images/placeholder.webp';
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
  } else if (img && typeof img === 'object' && img.url) {
    // 图片对象：同样只返回 _astro 发射资源
    const originalUrl = img.url;
    if (originalUrl.startsWith('/uploads/')) {
      const fileName = originalUrl.split('/').pop();
      const byFile = fileName ? resolveEmittedUrlSync(fileName, null) : null;
      if (byFile) return byFile;
      const hash = generateImageHash(originalUrl);
      const byHash = resolveEmittedUrlSync(fileName || hash, null);
      return byHash || '/images/placeholder.webp';
    }
    // 若不是 Strapi 的 uploads 资源，保留原链接（站内非 Strapi 静态图）
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