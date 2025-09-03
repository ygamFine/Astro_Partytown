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

  // 检查环境变量是否设置
  if (!STRAPI_STATIC_URL) {
    return null;
  }

  // 如果是本地路径但不是banner图片，则跳过
  if (imageUrl.startsWith('/images/') || imageUrl.startsWith('./') ||
      (imageUrl.startsWith('/assets/') && !imageUrl.startsWith('/assets/banner/'))) {
    return null;
  }

  // 如果是完整的Strapi URL（包括 Banner 服务器）
  if (imageUrl.startsWith(STRAPI_STATIC_URL)) {
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

      } else {
        // 其他图片转换为WebP格式，放在主目录
        targetDir = DEFAULT_IMAGE_CACHE_DIR;
        fileName = generateImageFileName(imageUrl, false);

      }

      // 确保目标目录存在
      await fs.mkdir(targetDir, { recursive: true });
      const localPath = path.join(targetDir, fileName);
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
      } else {
        // 其他图片进行WebP转换和压缩
        const conversionSuccess = await safeConvertToWebP(tempPath, localPath, fileName);
      }

      // 清理临时文件
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        // 忽略清理错误
      }

      // 步骤3: 更新图片映射文件
      try {
        const imageInfo = {
          fileName: fileName,
          hash: isBannerImage ? 
            fileName.replace(/\.(webp|jpg|jpeg|png|gif|svg|mp4|webm|mov)$/i, '') : 
            fileName.replace(/\.(webp|jpg|jpeg|png|gif|svg|mp4|webm|mov)$/i, ''),
          filePath: isBannerImage ? `banner/${fileName}` : fileName
        };
        await updateImageMapping([imageInfo]);
        console.log(`✅ 图片映射已更新: ${fileName}`);
        
        // 打印更新后的映射文件内容
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const { fileURLToPath } = await import('url');
          
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);
          const mappingFilePath = path.join(__dirname, '../data/strapi-image-urls.js');
          
          const mappingContent = await fs.readFile(mappingFilePath, 'utf-8');
          console.log('📄 更新后的映射文件内容:');
          console.log('=' .repeat(50));
          console.log(mappingContent);
          console.log('=' .repeat(50));
        } catch (readError) {
          console.warn('⚠️ 读取映射文件失败:', readError.message);
        }
      } catch (error) {
        console.warn('⚠️ 更新映射文件失败:', error.message);
      }

      // 步骤4: 返回公共访问路径（供 Astro Image 标签使用）
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
    
        bannerConfig = { bannerImages: [] };
        
        // 确保目录存在
        const configDir = path.dirname(bannerConfigPath);
        try {
          await fs.mkdir(configDir, { recursive: true });
        } catch (mkdirError) {
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
          }
        }

        // 检查hash是否匹配
        return configHash === urlHash || urlHash.includes(configHash);
      });

      if (!bannerConfigItem) {
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
        await fs.unlink(localPath);
      } catch {
        // 文件不存在，正常下载
      }

      // 下载图片
      const response = await fetch(fullUrl);
      if (!response.ok) {

        // 如果是移动端图片下载失败，尝试使用PC端图片替代
        if (bannerConfigItem.type === 'mobile' && bannerConfigItem.fallbackImage) {

          const fallbackUrl = bannerConfigItem.fallbackImage.originalUrl.startsWith('http') ?
            bannerConfigItem.fallbackImage.originalUrl :
            `${STRAPI_STATIC_URL}${bannerConfigItem.fallbackImage.originalUrl}`;

          try {
            const fallbackResponse = await fetch(fallbackUrl);
            if (!fallbackResponse.ok) {
              return null;
            }

            const fallbackBuffer = await fallbackResponse.arrayBuffer();
            await fs.writeFile(localPath, Buffer.from(fallbackBuffer));

            return `/assets/strapi/banner/${fileName}`;
          } catch (fallbackError) {
            return null;
          }
        }

        return null;
      }

      const buffer = await response.arrayBuffer();
      await fs.writeFile(localPath, Buffer.from(buffer));

      // 步骤3: 更新图片映射文件
      try {
        const imageInfo = {
          fileName: fileName,
          hash: hash,
          filePath: `banner/${fileName}`
        };
        await updateImageMapping([imageInfo]);
        console.log(`✅ Banner图片映射已更新: ${fileName}`);
        
        // 打印更新后的映射文件内容
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const { fileURLToPath } = await import('url');
          
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = path.dirname(__filename);
          const mappingFilePath = path.join(__dirname, '../data/strapi-image-urls.js');
          
          const mappingContent = await fs.readFile(mappingFilePath, 'utf-8');
          console.log('📄 更新后的映射文件内容:');
          console.log('=' .repeat(50));
          console.log(mappingContent);
          console.log('=' .repeat(50));
        } catch (readError) {
          console.warn('⚠️ 读取映射文件失败:', readError.message);
        }
      } catch (error) {
        console.warn('⚠️ 更新Banner映射文件失败:', error.message);
      }

      // 步骤4: 返回公共访问路径（供 Astro Image 标签使用）
      return `/assets/strapi/banner/${fileName}`;
    } catch (error) {
      return null;
    }
  }

  // 如果是相对路径，转换为绝对路径
  if (imageUrl.startsWith('/uploads/')) {
    // 不再依赖文件名判断，使用调用时传入的isBannerImage参数
    const fullUrl = `${STRAPI_STATIC_URL}${imageUrl}`;

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
  // 检查是否是 uploads 格式的路径
  if (!imagePath.startsWith('/uploads/')) {
    return null;
  }
  
  // 使用 downloadImage 函数处理
  const result = await downloadImage(imagePath, false);
  
  return result;
}

/**
 * 使用示例：
 * 
 * 完整流程示例：
 * 
 * // 步骤1: 下载图片并自动更新映射
 * const localPath = await downloadImage(imageUrl, false);
 * 
 * // 步骤2: 在 Astro 组件中使用
 * // 方式1: 直接使用返回的路径（推荐）
 * <img src={localPath} alt="图片" />
 * 
 * // 方式2: 通过 imageProcessor.js 处理（可选）
 * import { processImageForDisplay } from './imageProcessor.js';
 * const finalPath = processImageForDisplay(localPath);
 * 
 * // 方式3: 在 Astro Image 组件中使用
 * import { Image } from 'astro:assets';
 * <Image src={localPath} alt="图片" />
 * 
 * 手动操作示例：
 * 
 * // 手动更新图片映射（当 downloadImage 自动更新失败时）
 * import { updateImageMapping, generateImageMappingFile, scanAndGenerateMapping } from './imageConvert.js';
 * 
 * // 更新单个图片的映射
 * await updateImageMapping([{
 *   fileName: 'example.webp',
 *   hash: 'example',
 *   filePath: 'example.webp'
 * }]);
 * 
 * // 生成完整的映射文件
 * await generateImageMappingFile(['image1.webp', 'banner/image2.jpg']);
 * 
 * // 扫描目录并自动生成映射
 * const imageFiles = await scanAndGenerateMapping();
 * 
 * 职责分离：
 * - imageConvert.js: 负责下载、转换、自动更新映射文件、返回可用路径
 * - imageProcessor.js: 负责运行时路径映射和 Astro 组件支持
 * 
 * 数据流：
 * Strapi URL → 下载图片 → 更新映射 → 返回路径 → Astro Image 标签加载
 */

/**
 * 更新图片映射文件
 * @param {Array} downloadedImages - 新下载的图片信息数组
 * @param {string} mappingFilePath - 映射文件路径，默认为 strapi-image-urls.js
 */
export async function updateImageMapping(downloadedImages = [], mappingFilePath = '../data/strapi-image-urls.js') {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const fullMappingPath = path.join(__dirname, mappingFilePath);
    
    // 读取现有的映射文件
    let existingMapping = {};
    try {
      const existingContent = await fs.readFile(fullMappingPath, 'utf-8');
      // 提取现有的 STRAPI_IMAGE_URLS 对象
      const match = existingContent.match(/export const STRAPI_IMAGE_URLS = ({[\s\S]*?});/);
      if (match) {
        // 简单解析现有的映射（这里可以改进为更安全的解析）
        const mappingStr = match[1];
        // 提取键值对
        const pairs = mappingStr.match(/'([^']+)':\s*([^,\s]+)/g);
        if (pairs) {
          pairs.forEach(pair => {
            const [key, value] = pair.split(':').map(s => s.trim().replace(/'/g, ''));
            existingMapping[key] = value;
          });
        }
      }
    } catch (error) {
      console.log('现有映射文件不存在，将创建新文件');
    }
    
    // 添加新的映射关系
    downloadedImages.forEach(imageInfo => {
      const { fileName, hash, filePath } = imageInfo;
      if (fileName && hash) {
        existingMapping[fileName] = hash;
        existingMapping[hash] = hash;
        
        // 如果是banner目录中的文件，也添加banner路径映射
        if (filePath && filePath.includes('banner/')) {
          const bannerKey = `banner/${fileName}`;
          const bannerPath = `/assets/${filePath}`;
          existingMapping[bannerKey] = hash;
          existingMapping[bannerPath] = hash;
        }
      }
    });
    
    // 生成新的映射文件内容
    await generateImageMappingFile(Object.keys(existingMapping), mappingFilePath);
    
    console.log(`✅ 图片映射文件更新完成，包含 ${Object.keys(existingMapping).length} 个映射关系`);
    return true;
    
  } catch (error) {
    console.error('❌ 更新图片映射失败:', error.message);
    return false;
  }
}

/**
 * 生成完整的图片映射文件
 * @param {Array} imageFiles - 图片文件列表
 * @param {string} mappingFilePath - 映射文件路径，默认为 strapi-image-urls.js
 */
export async function generateImageMappingFile(imageFiles = [], mappingFilePath = '../data/strapi-image-urls.js') {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const fullMappingPath = path.join(__dirname, mappingFilePath);
    
    // 确保目录存在
    const dir = path.dirname(fullMappingPath);
    await fs.mkdir(dir, { recursive: true });
    
    // 生成文件内容
    const lines = [];
    lines.push('// 自动生成：Strapi 图片 URL 映射 (由 imageConvert.js 生成)');
    lines.push('// 注意：实际部署时 Astro 会将文件打包到 _astro 目录中');
    lines.push('');
    
    // 生成 import 语句 - 去重处理
    const uniqueImports = new Map();
    imageFiles.forEach((file) => {
      const base = path.basename(file);
      const hash = base.replace(/\.(webp|jpg|jpeg|png|gif|svg|mp4|webm|mov)$/i, '');
      
      // 如果已经存在相同的hash，跳过重复导入
      if (!uniqueImports.has(hash)) {
        uniqueImports.set(hash, file);
        lines.push(`import ${hash} from '../assets/strapi/${file}';`);
      }
    });
    
    lines.push('');
    lines.push('export const STRAPI_IMAGE_URLS = {');
    
    imageFiles.forEach((file) => {
      const base = path.basename(file);
      const hash = base.replace(/\.(webp|jpg|jpeg|png|gif|svg|mp4|webm|mov)$/i, '');
      lines.push(`  '${base}': ${hash},`);
      lines.push(`  '${hash}': ${hash},`);
      
      // 如果是banner目录中的文件，也添加banner路径映射
      if (file.includes('banner/')) {
        const bannerKey = `banner/${base}`;
        const bannerPath = `/assets/${file}`;
        lines.push(`  '${bannerKey}': ${hash},`);
        lines.push(`  '${bannerPath}': ${hash},`);
      }
    });
    
    lines.push('};');
    
    // 写入文件
    await fs.writeFile(fullMappingPath, lines.join('\n'));
    
    console.log(`✅ 图片映射文件生成完成，包含 ${imageFiles.length} 个文件`);
    return true;
    
  } catch (error) {
    console.error('❌ 生成图片映射文件失败:', error.message);
    return false;
  }
}

/**
 * 扫描目录并生成完整的图片映射
 * @param {string} imageDir - 图片目录路径，默认为 src/assets/strapi
 * @param {string} mappingFilePath - 映射文件路径
 */
export async function scanAndGenerateMapping(imageDir = '../assets/strapi', mappingFilePath = '../data/strapi-image-urls.js') {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const fullImageDir = path.join(__dirname, imageDir);
    
    // 扫描目录获取所有图片文件
    const imageFiles = [];
    
    async function scanDirectory(dir) {
      try {
        const items = await fs.readdir(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = await fs.stat(fullPath);
          
          if (stat.isDirectory()) {
            // 递归扫描子目录
            await scanDirectory(fullPath);
          } else if (stat.isFile()) {
            // 检查是否是图片文件
            const ext = path.extname(item).toLowerCase();
            if (['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.mp4', '.webm', '.mov'].includes(ext)) {
              // 转换为相对路径
              const relativePath = path.relative(fullImageDir, fullPath);
              imageFiles.push(relativePath);
            }
          }
        }
      } catch (error) {
        console.warn(`扫描目录失败: ${dir}`, error.message);
      }
    }
    
    await scanDirectory(fullImageDir);
    
    // 生成映射文件
    if (imageFiles.length > 0) {
      await generateImageMappingFile(imageFiles, mappingFilePath);
      return imageFiles;
    } else {
      console.log('未找到图片文件');
      return [];
    }
    
  } catch (error) {
    console.error('❌ 扫描并生成映射失败:', error.message);
    return [];
  }
}