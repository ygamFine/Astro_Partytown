/**
 * 通用图片处理工具
 * 用于处理Strapi图片映射和本地缓存，支持 Astro Image 组件
 */

import { generateImageHash } from '@utils/hashUtils.js';

// 由构建脚本生成的URL映射（指向最终发射到/_astro/...的绝对URL）
let EMITTED_URLS = null;
let EMITTED_URLS_LOADING = false;
let EMITTED_URLS_LOADED = false;

// 异步加载 EMITTED_URLS
async function loadEmittedUrls() {
  if (EMITTED_URLS_LOADING) {
    // 如果正在加载，等待加载完成
    while (EMITTED_URLS_LOADING) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return EMITTED_URLS;
  }
  
  if (EMITTED_URLS_LOADED && EMITTED_URLS) {
    return EMITTED_URLS;
  }
  
  EMITTED_URLS_LOADING = true;
  
  try {
    // 智能路径解析：尝试多个可能的位置（与 imageConvert.js 保持一致）
    const possiblePaths = [
      '../data/strapi-image-urls.js',           // 开发环境
      '../../data/strapi-image-urls.js',        // 构建后环境
      './data/strapi-image-urls.js',            // 当前目录
      '/data/strapi-image-urls.js',             // 绝对路径
    ];
    
    let module = null;
    let loadedPath = null;
    
    // 尝试每个可能的路径
    for (const testPath of possiblePaths) {
      try {
        module = await import(testPath);
        loadedPath = testPath;
        console.log(`🎯 成功加载映射文件: ${testPath}`);
        break;
      } catch (error) {
        // 继续尝试下一个路径
        console.log(`⚠️ 路径 ${testPath} 加载失败: ${error.message}`);
      }
    }
    
    // 如果相对路径都失败了，尝试使用 process.cwd() 构建的路径
    if (!module) {
      const { fileURLToPath } = await import('url');
      const path = await import('path');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      const fallbackPaths = [
        path.join(__dirname, '../data/strapi-image-urls.js'),           // 开发环境
        path.join(__dirname, '../../data/strapi-image-urls.js'),        // 构建后环境
        path.join(process.cwd(), 'src/data/strapi-image-urls.js'),     // 项目根目录
        path.join(process.cwd(), 'dist/data/strapi-image-urls.js'),    // 构建输出目录
        path.join(process.cwd(), 'data/strapi-image-urls.js'),         // 根目录下的data
      ];
      
      for (const testPath of fallbackPaths) {
        try {
          module = await import(testPath);
          loadedPath = testPath;
          console.log(`🎯 成功加载映射文件（回退路径）: ${testPath}`);
          break;
        } catch (error) {
          // 继续尝试下一个路径
          console.log(`⚠️ 回退路径 ${testPath} 加载失败: ${error.message}`);
        }
      }
    }
    
    if (module && module.STRAPI_IMAGE_URLS) {
      EMITTED_URLS = module.STRAPI_IMAGE_URLS;
      EMITTED_URLS_LOADED = true;
      console.log(`✅ EMITTED_URLS 加载成功，来源: ${loadedPath}`);
    } else {
      throw new Error('未找到有效的映射文件或映射数据');
    }
  } catch (error) {
    console.warn('⚠️ EMITTED_URLS 加载失败:', error.message);
    EMITTED_URLS = {};
  } finally {
    EMITTED_URLS_LOADING = false;
  }
  
  return EMITTED_URLS;
}

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
 * @returns {Promise<string>} 处理后的路径
 */
async function processPath(path, forAstro = false) {
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

async function resolveEmittedUrlSync(fileNameOrHash, fallback) {
  const table = await loadEmittedUrls();
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
async function resolveEmittedModuleSync(fileNameOrHash) {
  const table = await loadEmittedUrls();
  console.log('----------------------------打印开始----------------------------')
  console.log('打印映射表格', typeof table);
  console.log('打印映射表格', table);
  console.log('图片文件名称', fileNameOrHash);
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~打印结束~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
  if (!table) return null;
  const imageObject = table[fileNameOrHash];
  console.log('打印imageObject', imageObject);
  if (!imageObject) return null;
  if (typeof imageObject === 'object' && imageObject.src) return imageObject;
  // 仅当是远程 URL 字符串时可用于 <Image>，否则返回 null
  if (typeof imageObject === 'string' && /^https?:\/\//i.test(imageObject)) return imageObject;
  return null;
}

// 重新导出 loadImageMapping 函数以保持向后兼容性
export { loadImageMappingWithCreate as loadImageMapping } from '@lib/imageUtils.js';

// 统一的图片处理函数 - 用于替换页面中的重复代码
export async function processImageForDisplay(imageData, imageMapping = { strapiImages: [] }) {
  if (!imageData) return null;
  
  // 如果是字符串，使用通用路径处理函数
  if (typeof imageData === 'string') {
    return await processPath(imageData, false);
  }
  
  // 如果是数组，找到第一个有效的图片
  if (Array.isArray(imageData)) {
    const processedImages = await Promise.all(
      imageData.map(img => processSingleImage(img, imageMapping))
    );
    
    return processedImages.length > 0 ? processedImages[0] : null;
  }
  
  return await processSingleImage(imageData, imageMapping);
}

// 专供 astro:assets 的 <Image> / getImage 使用：优先返回“导入的图片对象”，否则返回远程 URL，找不到返回 null
export async function processImageForAstro(imageData) {
  if (!imageData) return '/images/placeholder.webp';

  if (typeof imageData === 'string') {
    return await processPath(imageData, true);
  }

  if (Array.isArray(imageData)) {
    for (const candidate of imageData) {
      const mod = await processImageForAstro(candidate);
      if (mod) return mod;
    }
    return null;
  }

  if (imageData && typeof imageData === 'object') {
    // 兼容传入图片对象：支持 .media.url 和 .url 格式
    const originalUrl = extractUrlFromImageObject(imageData);
    
    if (typeof originalUrl === 'string') return await processImageForAstro(originalUrl);
  }

  return null;
}

export async function processImagesForAstro(images) {
  if (!images || !Array.isArray(images)) return [];
  const processedImages = await Promise.all(
    images.map(img => processImageForAstro(img))
  );
  return processedImages.filter(Boolean);
}

// 处理单个图片
export async function processImage(imageData, imageMapping = { strapiImages: [] }) {
  if (!imageData) return null;
  
  // 如果是字符串，使用通用路径处理函数
  if (typeof imageData === 'string') {
    return await processPath(imageData, false);
  }
  
  if (Array.isArray(imageData)) {
    // 如果是数组，找到第一个有效的图片
    const processedImages = await Promise.all(
      imageData.map(img => processSingleImage(img, imageMapping))
    );
    
    return processedImages.length > 0 ? processedImages[0] : null;
  }
  
  return await processSingleImage(imageData, imageMapping);
}

// 处理单个图片
async function processSingleImage(img, imageMapping) {
  if (!img) return null;
  
  if (typeof img === 'string') {
    // 兼容逗号分隔的多图字符串，取第一个可用图
    if (img.includes(',')) {
      const candidates = img.split(',').map(s => s.trim()).filter(Boolean);
      for (const candidate of candidates) {
        const resolved = await processSingleImage(candidate, imageMapping);
        if (resolved && resolved !== '/images/placeholder.webp') return resolved;
      }
      return null;
    }
    // 使用通用路径处理函数
    return await processPath(img, false);
    
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
export async function processImageArrayForDisplay(images, imageMapping) {
  if (!images || !Array.isArray(images)) {
    return [];
  }
  
  const processedImages = await Promise.all(
    images.map(img => processImageForDisplay(img, imageMapping))
  );
  
  return processedImages.filter(img => img && img !== '/images/placeholder.webp');
} 