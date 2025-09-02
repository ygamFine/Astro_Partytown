/**
 * 图片转换工具
 * 从 download-strapi-images.js 提取的图片下载和转换功能
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import { generateImageHash } from './hashUtils.js';

const execAsync = promisify(exec);

// 环境变量配置
const STRAPI_STATIC_URL = process.env.STRAPI_STATIC_URL || import.meta.env?.STRAPI_STATIC_URL;

// 默认目录配置
const DEFAULT_IMAGE_CACHE_DIR = process.env.IMAGE_CACHE_DIR || 'src/assets/strapi';
// Banner图片目录
const DEFAULT_BANNER_IMAGE_DIR = path.join(DEFAULT_IMAGE_CACHE_DIR, 'banner');


/**
 * 专门处理GIF文件的转换
 */
export async function handleGifConversion(inputPath, outputPath, fileName) {
  // 方法1: 使用sharp库处理GIF（推荐方法）
  try {
    await sharp(inputPath, { animated: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    // 静默处理错误，继续尝试其他方法
  }

  // 方法2: 使用sharp处理静态GIF（只取第一帧）
  try {
    await sharp(inputPath, { pages: 1 })
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    // 静默处理错误，继续尝试其他方法
  }

  // 方法3: 使用cwebp转换（备用方法）
  try {
    await execAsync(`cwebp -q 80 -m 6 "${inputPath}" -o "${outputPath}"`);
    return true;
  } catch (error) {
    // 静默处理错误，继续尝试其他方法
  }

  // 方法4: 保存原GIF文件作为回退
  try {
    const fallbackPath = outputPath.replace('.webp', '.gif');
    await fs.copyFile(inputPath, fallbackPath);
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * 检查WebP转换工具是否可用
 */
export async function checkWebPTools() {
  try {
    await execAsync('cwebp -version');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 验证图片文件是否有效
 */
export async function validateImageFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (stats.size === 0) {
      return false;
    }

    // 读取文件头部来验证格式
    const buffer = await fs.readFile(filePath, { start: 0, end: 12 });
    const header = buffer.toString('hex');

    // 检查常见图片格式的魔数
    if (header.startsWith('47494638') || header.startsWith('47494637')) {
      // GIF格式
      return true;
    } else if (header.startsWith('ffd8ff')) {
      // JPEG格式
      return true;
    } else if (header.startsWith('89504e47')) {
      // PNG格式
      return true;
    } else if (header.startsWith('52494646') && header.includes('57454250')) {
      // WebP格式
      return true;
    }

    return false;
  } catch (error) {
    console.log(`⚠️  文件验证失败: ${filePath}`);
    return false;
  }
}

/**
 * 安全转换为WebP格式
 */
export async function safeConvertToWebP(inputPath, outputPath, fileName) {
  try {
    // 首先验证输入文件
    const isValid = await validateImageFile(inputPath);
    if (!isValid) {
      return false;
    }

    // 获取文件扩展名
    const ext = path.extname(inputPath).toLowerCase();

    // 对于GIF文件，使用特殊处理
    if (ext === '.gif') {
      return await handleGifConversion(inputPath, outputPath, fileName);
    } else {
      // 对于其他格式，优先使用sharp库
      try {
        await sharp(inputPath)
          .webp({ quality: 80, effort: 6 })
          .toFile(outputPath);
        return true;
      } catch (sharpError) {
        // 回退到cwebp
        try {
          await execAsync(`cwebp -q 80 -m 6 "${inputPath}" -o "${outputPath}"`);
          return true;
        } catch (cwebpError) {
          throw cwebpError;
        }
      }
    }
  } catch (error) {
    // 尝试保存原文件作为回退
    try {
      const ext = path.extname(inputPath);
      const fallbackPath = outputPath.replace('.webp', ext);
      await fs.copyFile(inputPath, fallbackPath);
      return false;
    } catch (fallbackError) {
      return false;
    }
  }
}

/**
 * 生成图片文件名（WebP格式）
 */
export function generateImageFileName(originalUrl, isBannerImage = false) {
  const hash = generateImageHash(originalUrl);
  
  // 清理哈希值，移除特殊字符，确保文件名安全
  const cleanHash = hash.replace(/[^a-zA-Z0-9]/g, '');
  
  // 如果清理后为空，使用备用哈希
  if (!cleanHash) {
    const fallbackHash = generateUrlHash(originalUrl).substring(0, 12);
    return `${fallbackHash}.webp`;
  }
  
  return `${cleanHash}.webp`;
}

/**
 * 下载并转换为WebP格式
 * @param {string} imageUrl - 图片URL
 * @param {boolean} isBannerImage - 是否是Banner图片
 * @param {string} STRAPI_STATIC_URL - Strapi静态URL
 * @param {string} DEFAULT_IMAGE_CACHE_DIR - 图片缓存目录
 * @param {string} DEFAULT_BANNER_IMAGE_DIR - Banner图片目录
 */
export async function downloadImage(imageUrl, isBannerImage = false) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  // 如果是本地路径但不是banner图片，则跳过
  if (imageUrl.startsWith('/images/') || imageUrl.startsWith('./') ||
      (imageUrl.startsWith('/assets/') && !imageUrl.startsWith('/assets/banner/'))) {
    return null;
  }

  // 如果是完整的Strapi URL（包括 Banner 服务器）
  if (imageUrl.startsWith(STRAPI_STATIC_URL)) {
    console.log(`🔄 处理完整的Strapi URL: ${imageUrl}`);
    try {
      // 确定目标目录和文件名
      let targetDir, fileName;

      if (isBannerImage) {
        // Banner图片保持原始格式，不压缩，放在banner子目录
        targetDir = DEFAULT_BANNER_IMAGE_DIR;
        const url = new URL(imageUrl, STRAPI_STATIC_URL);
        const pathname = url.pathname;
        const hash = generateImageHash(pathname);
        // 清理哈希值，确保文件名安全
        const cleanHash = hash.replace(/[^a-zA-Z0-9]/g, '');
        const originalExt = path.extname(pathname) || '.jpg';
        fileName = `${cleanHash}${originalExt}`;
        
        console.log(`🔍 Banner图片文件名生成:`, {
          originalUrl: imageUrl,
          pathname,
          originalHash: hash,
          cleanHash,
          originalExt,
          finalFileName: fileName
        });
      } else {
        // 其他图片转换为WebP格式，放在主目录
        targetDir = DEFAULT_IMAGE_CACHE_DIR;
        fileName = generateImageFileName(imageUrl, false);
        
        console.log(`🔍 普通图片文件名生成:`, {
          originalUrl: imageUrl,
          finalFileName: fileName
        });
      }

      // 确保目标目录存在
      await fs.mkdir(targetDir, { recursive: true });
      console.log(`🔄 确保目标目录存在: ${targetDir}`);
      const localPath = path.join(targetDir, fileName);
      console.log(`🔄 本地路径: ${localPath}`);
      // 检查文件是否存在
      let fileExists = false;
      try {
        await fs.access(localPath);
        fileExists = true;
      } catch {
        // 文件不存在
      }

      // 如果文件已存在，直接返回公共访问路径
      if (fileExists) {
        console.log(`📁 文件已存在，跳过下载: ${fileName}`);
        // 直接返回公共访问路径
        return isBannerImage ? 
          `/assets/strapi/banner/${fileName}` : 
          `/assets/strapi/${fileName}`;
      }

      // 下载原始图片到临时文件
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return null;
      }

      const buffer = await response.arrayBuffer();
      const tempDir = path.join(process.cwd(), 'temp');
      await fs.mkdir(tempDir, { recursive: true });

      const originalExt = path.extname(new URL(imageUrl).pathname) || '.jpg';
      const tempFileName = `${generateImageHash(imageUrl)}${originalExt}`;
      const tempPath = path.join(tempDir, tempFileName);

      await fs.writeFile(tempPath, Buffer.from(buffer));

      if (isBannerImage) {
        // Banner图片直接复制到目标位置，不进行压缩
        await fs.copyFile(tempPath, localPath);
        console.log(`📷 Banner图片已下载（不压缩）: banner/${fileName}`);
      } else {
        // 其他图片进行WebP转换和压缩
        const conversionSuccess = await safeConvertToWebP(tempPath, localPath, fileName);
        if (!conversionSuccess) {
          console.log(`⚠️  WebP转换失败，但继续处理: ${fileName}`);
        }
      }

      // 清理临时文件
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        // 忽略清理错误
      }

      // 直接返回公共访问路径
      return isBannerImage ? 
        `/assets/strapi/banner/${fileName}` : 
        `/assets/strapi/${fileName}`;
    } catch (error) {
      return null;
    }
  }

  // 处理本地banner图片路径，重新下载
  if (imageUrl.startsWith('/assets/banner/')) {
    try {
      // 从API原始数据中找到对应的真实URL
      const bannerConfigPath = path.join(process.cwd(), 'src/data/banner-images.json');
      
      // 检查配置文件是否存在，如果不存在则创建默认配置
      let bannerConfig;
      try {
        const bannerConfigData = await fs.readFile(bannerConfigPath, 'utf-8');
        bannerConfig = JSON.parse(bannerConfigData);
      } catch (error) {
        console.warn('Banner配置文件不存在，创建默认配置');
        bannerConfig = { bannerImages: [] };
        
        // 确保目录存在
        const configDir = path.dirname(bannerConfigPath);
        try {
          await fs.mkdir(configDir, { recursive: true });
        } catch (mkdirError) {
          console.warn('创建配置目录失败:', mkdirError.message);
        }
      }

      // 找到对应的banner配置
      const bannerConfigItem = bannerConfig.bannerImages.find(item => {
        // 直接比较hash部分
        const configHash = path.basename(item.originalUrl, path.extname(item.originalUrl));
        const urlFileName = path.basename(imageUrl, path.extname(imageUrl));

        // 如果文件名以L3VwbG9hZHMv开头，尝试base64解码
        let urlHash = urlFileName;
        if (urlFileName.startsWith('L3VwbG9hZHMv')) {
          try {
            // 移除L3VwbG9hZHMv前缀并解码
            const encodedPart = urlFileName.replace('L3VwbG9hZHMv', '');
            urlHash = Buffer.from(encodedPart, 'base64').toString('utf-8');
            // 移除扩展名
            urlHash = path.basename(urlHash, path.extname(urlHash));
          } catch (error) {
            // 解码失败，使用原始文件名
            console.warn(`⚠️  Base64解码失败: ${urlFileName}`);
          }
        }

        // 检查hash是否匹配
        return configHash === urlHash || urlHash.includes(configHash);
      });

      if (!bannerConfigItem) {
        console.warn(`⚠️  找不到 ${imageUrl} 对应的banner配置`);
        return null;
      }

      // 使用原始URL重新下载
      const originalUrl = bannerConfigItem.originalUrl;

      let fullUrl;

      if (originalUrl.startsWith('http')) {
        fullUrl = originalUrl;
      } else if (originalUrl.startsWith('/uploads/')) {
        fullUrl = `${STRAPI_STATIC_URL}${originalUrl}`;
      } else {
        console.warn(`⚠️  无效的原始URL: ${originalUrl}`);
        return null;
      }

      // 确定目标目录和文件名
      const targetDir = DEFAULT_BANNER_IMAGE_DIR;
      const url = new URL(fullUrl, STRAPI_STATIC_URL);
      const pathname = url.pathname;
      const hash = generateImageHash(pathname);
      const originalExt = path.extname(pathname) || '.jpg';
      const fileName = `${hash}${originalExt}`;
      const localPath = path.join(targetDir, fileName);

      // 确保目标目录存在
      await fs.mkdir(targetDir, { recursive: true });

      // 检查文件是否存在，如果存在则删除
      try {
        await fs.access(localPath);
        console.log(`🔄 强制重新下载Banner图片: ${fileName}`);
        console.log(`📁 文件路径: ${localPath}`);
        await fs.unlink(localPath);
        console.log(`🗑️  删除现有Banner文件，准备重新下载: ${fileName}`);
      } catch {
        // 文件不存在，正常下载
      }

      // 下载图片
      console.log(`📥 下载Banner图片: ${fullUrl}`);
      const response = await fetch(fullUrl);
      if (!response.ok) {
        console.warn(`⚠️  下载失败: ${fullUrl} (${response.status})`);

        // 如果是移动端图片下载失败，尝试使用PC端图片替代
        if (bannerConfigItem.type === 'mobile' && bannerConfigItem.fallbackImage) {
          console.log(`🔄 移动端图片下载失败，使用PC端图片替代: ${bannerConfigItem.fallbackImage.originalUrl}`);

          const fallbackUrl = bannerConfigItem.fallbackImage.originalUrl.startsWith('http') ?
            bannerConfigItem.fallbackImage.originalUrl :
            `${STRAPI_STATIC_URL}${bannerConfigItem.fallbackImage.originalUrl}`;

          try {
            const fallbackResponse = await fetch(fallbackUrl);
            if (!fallbackResponse.ok) {
              console.warn(`⚠️  PC端图片也下载失败: ${fallbackUrl} (${fallbackResponse.status})`);
              return null;
            }

            const fallbackBuffer = await fallbackResponse.arrayBuffer();
            await fs.writeFile(localPath, Buffer.from(fallbackBuffer));

            console.log(`📱 使用PC端图片替代移动端图片（不压缩）: banner/${fileName}`);
            return `/assets/strapi/banner/${fileName}`;
          } catch (fallbackError) {
            console.warn(`⚠️  PC端图片替代失败:`, fallbackError.message);
            return null;
          }
        }

        return null;
      }

      const buffer = await response.arrayBuffer();
      await fs.writeFile(localPath, Buffer.from(buffer));

      console.log(`📷 Banner图片已下载（不压缩）: banner/${fileName}`);
      return `/assets/strapi/banner/${fileName}`;
    } catch (error) {
      console.warn(`⚠️  处理本地banner路径失败: ${imageUrl}`, error.message);
      return null;
    }
  }

  // 如果是相对路径，转换为绝对路径
  if (imageUrl.startsWith('/uploads/')) {
    // 不再依赖文件名判断，使用调用时传入的isBannerImage参数
    const fullUrl = `${STRAPI_STATIC_URL}${imageUrl}`;

    console.log(`处理相对路径: ${imageUrl} -> ${fullUrl} (Banner: ${isBannerImage})`);
    return await downloadImage(fullUrl, isBannerImage);
  }

  return null;
}

/**
 * 提取图片URL
 */
export function extractImageUrls(data) {
  const urls = [];

  function extractFromObject(obj) {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      // 处理字符串类型的URL
      if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/uploads/'))) {
        urls.push(value);
      }
      // 处理数组类型
      else if (Array.isArray(value)) {
        value.forEach(item => {
          if (!item) return; // 跳过null/undefined项
          if (typeof item === 'string' && (item.startsWith('http') || item.startsWith('/uploads/'))) {
            urls.push(item);
          } else if (typeof item === 'object' && item && item.url) {
            // 处理图片对象，提取url字段
            urls.push(item.url);
          } else if (typeof item === 'object' && item) {
            // 递归处理数组中的对象
            extractFromObject(item);
          }
        });
      }
      // 处理对象类型
      else if (typeof value === 'object' && value) {
        // 如果对象有url字段，直接提取
        if (value.url) {
          urls.push(value.url);
        } else {
          // 递归处理嵌套对象
          extractFromObject(value);
        }
      }
    }
  }

  // 处理data字段（Strapi API的标准响应格式）
  if (data && data.data) {
    if (Array.isArray(data.data)) {
      data.data.forEach(item => extractFromObject(item));
    } else {
      extractFromObject(data.data);
    }
  } else {
    extractFromObject(data);
  }

  return [...new Set(urls)]; // 去重
}

/**
 * 测试处理 "/uploads/logo_png_f8afa2762b.webp" 格式的图片路径
 * @param {string} imagePath - 图片路径，如 "/uploads/logo_png_f8afa2762b.webp"
 */
export async function processUploadImage(imagePath) {
  console.log(`🔄 开始处理图片路径: ${imagePath}`);
  
  // 检查是否是 uploads 格式的路径
  if (!imagePath.startsWith('/uploads/')) {
    console.log(`❌ 不是 uploads 格式的路径: ${imagePath}`);
    return null;
  }
  
  // 使用 downloadImage 函数处理
  const result = await downloadImage(imagePath, false);
  
  if (result) {
    console.log(`✅ 图片处理成功: ${result}`);
    console.log(`📁 本地文件路径: ${path.join(DEFAULT_IMAGE_CACHE_DIR, result)}`);
  } else {
    console.log(`❌ 图片处理失败: ${imagePath}`);
  }
  
  return result;
}

/**
 * 使用示例：
 * 
 * // 1. 使用 imageConvert.js 下载和转换图片
 * const localPath = await downloadImage(imageUrl, false);
 * 
 * // 2. 在组件中使用 imageProcessor.js 进行路径映射（可选）
 * // import { processImageForDisplay } from './imageProcessor.js';
 * // const finalPath = processImageForDisplay(localPath);
 * 
 * // 3. 或者直接使用返回的公共路径（如 /assets/strapi/xxx.webp）
 * const publicPath = await processLogoImage('/uploads/logo.png');
 * 
 * 职责分离：
 * - imageConvert.js: 负责下载、转换、返回本地文件路径
 * - imageProcessor.js: 负责运行时路径映射和 Astro 组件支持
 */