#!/usr/bin/env node

/**
 * Strapi 图片下载脚本
 * 在构建时下载所有Strapi API中的图片到本地
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateImageHash } from '../src/utils/hashUtils.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
// 复用通用 Strapi 客户端（仅封装 HTTP 层）
import { STRAPI_STATIC_URL, STRAPI_STATIC_URL_NEW } from '../src/lib/strapiClient.js';
import { getBannerData, getCommonBannerData, getProducts, getNews, getCases } from '../src/lib/strapi.js';
// 统一复用高层 API 获取语言列表，避免重复实现
import { getSupportedLanguages as fetchSupportedLanguages } from '../src/lib/strapi.js';

const execAsync = promisify(exec);

// 加载环境变量
import { config } from 'dotenv';
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从客户端导出的常量中获取配置（避免与其它模块重复定义）

// 下载到源码资产目录，便于打包进 _astro
const IMAGE_CACHE_DIR = process.env.IMAGE_CACHE_DIR || 'src/assets/strapi';



// 从环境变量获取启用的语言，如果没有设置则从API获取
let ENABLED_LOCALES = process.env.ENABLED_LANGUAGES ? process.env.ENABLED_LANGUAGES.split(',') : [];

// 如果没有设置环境变量，从统一 API 获取支持的语言


/**
 * 专门处理GIF文件的转换
 */
async function handleGifConversion(inputPath, outputPath, fileName) {
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
 * 生成图片文件名（WebP格式）
 */
function generateImageFileName(originalUrl) {
  const url = new URL(originalUrl, STRAPI_STATIC_URL);
  const pathname = url.pathname;
  const hash = generateImageHash(pathname);
  return `${hash}.webp`;
}

/**
 * 检查WebP转换工具是否可用
 */
async function checkWebPTools() {
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
async function validateImageFile(filePath) {
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
async function safeConvertToWebP(inputPath, outputPath, fileName) {
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
 * 下载并转换为WebP格式
 */
async function downloadImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  // 如果已经是本地路径，跳过
  if (imageUrl.startsWith('/images/') || imageUrl.startsWith('./')) {
    return null;
  }

  // 如果是完整的Strapi URL（包括 Banner 服务器）
  if (imageUrl.startsWith(STRAPI_STATIC_URL) || imageUrl.startsWith(STRAPI_STATIC_URL_NEW)) {
    try {
      const fileName = generateImageFileName(imageUrl);
      const localPath = path.join(IMAGE_CACHE_DIR, fileName);

      // 检查WebP文件是否已存在
      try {
        await fs.access(localPath);
        return null;
      } catch {
        // 文件不存在，需要下载和转换
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

      // 直接使用安全的WebP转换（优先使用sharp库）
      const conversionSuccess = await safeConvertToWebP(tempPath, localPath, fileName);
      if (!conversionSuccess) {
        console.log(`⚠️  WebP转换失败，但继续处理: ${fileName}`);
      }

      // 清理临时文件
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        // 忽略清理错误
      }

      return fileName;
    } catch (error) {
      return null;
    }
  }

  // 如果是相对路径，转换为绝对路径
  if (imageUrl.startsWith('/uploads/')) {
    // TODO: 数据歉意完需要更改为指定的地址
    // const fullUrl = `${STRAPI_STATIC_URL}${imageUrl}`;
    // 对于 Banner 图片，使用正确的服务器地址
    const fullUrl = imageUrl.includes('banner') ? 
      `${STRAPI_STATIC_URL_NEW}${imageUrl}` : 
      `${STRAPI_STATIC_URL}${imageUrl}`;
    return await downloadImage(fullUrl);
  }

  return null;
}

/**
 * 提取图片URL
 */
function extractImageUrls(data) {
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
 * 获取所有数据并下载图片
 */
async function downloadAllImages() {
  await ensureCacheDir();

  // 如果没有设置语言列表，从API获取
  if (ENABLED_LOCALES.length === 0) {
    ENABLED_LOCALES = (await fetchSupportedLanguages()).map(l => l.code);
  }

  const allImageUrls = new Set();
  let totalDownloaded = 0;

  // 获取所有语言的数据（带分页）
  for (const locale of ENABLED_LOCALES) {
    try {
      // 产品（统一接口，原始结构 + 全量分页）
      const productsData = await getProducts({ locale, paginate: 'all', mode: 'raw' });
      extractImageUrls(productsData).forEach(url => allImageUrls.add(url));

      // 新闻（统一接口，原始结构 + 全量分页）
      const newsData = await getNews({ locale, paginate: 'all', mode: 'raw' });
      extractImageUrls(newsData).forEach(url => allImageUrls.add(url));

      // 案例（统一接口，原始结构 + 全量分页）
      const casesData = await getCases({ locale, paginate: 'all', mode: 'raw' });
      extractImageUrls(casesData).forEach(url => allImageUrls.add(url));
    } catch (error) {
      // 静默处理错误
    }
  }

  // Banner设置（不需要分页，全局获取一次）
  try {
    const banners = await getBannerData();
    if (banners && Array.isArray(banners)) {
      const bannerUrls = extractImageUrls({ data: banners });
      console.log('📊 Banner 中提取到', bannerUrls.length, '个图片 URL');
      bannerUrls.forEach(url => allImageUrls.add(url));
    }
  } catch {}

  // 下载所有图片
  console.log('📥 准备下载', allImageUrls.size, '个图片');
  
  const downloadPromises = Array.from(allImageUrls).map(url => downloadImage(url));
  const results = await Promise.allSettled(downloadPromises);

  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      totalDownloaded++;
    }
  });
  
  console.log('✅ 成功下载', totalDownloaded, '个图片');

  // 生成图片映射文件
  await generateImageMapping();
}

/**
 * 生成图片映射文件
 */
async function generateImageMapping() {
  try {
    // 检查 src/assets/strapi 目录是否存在
    const assetsImagesDir = path.join(__dirname, '../src/assets/strapi');
    const assetsImagesExists = await fs.access(assetsImagesDir).then(() => true).catch(() => false);

    if (!assetsImagesExists) {
      console.warn('Assets images 目录不存在，跳过图片映射生成');
      return;
    }

    // 获取实际存在的文件
    const files = await fs.readdir(assetsImagesDir);
    const imageFiles = files.filter(file => /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(file));

    console.log(`找到 ${imageFiles.length} 个图片文件用于映射`);

    // 1) 生成 JSON 映射（可供其它工具参考）
    const jsonMapping = {
      // 构建后实际可访问的资源前缀（Astro 会把导入的图片发射到 /assets）
      strapiImages: imageFiles.map(file => `/assets/${file}`),
      webpImages: imageFiles.filter(file => file.endsWith('.webp')).map(file => `/assets/${file}`),
      totalCount: imageFiles.length,
      webpCount: imageFiles.filter(file => file.endsWith('.webp')).length,
      generatedAt: new Date().toISOString()
    };
    const mappingJsonPath = path.join(__dirname, '../src/data/strapi-image-mapping.json');
    await fs.writeFile(mappingJsonPath, JSON.stringify(jsonMapping, null, 2));

    // 2) 生成简单的 URL 映射模块
    const lines = [];
    lines.push('// 自动生成：Strapi 图片 URL 映射 (由构建脚本生成)');
    lines.push('// 注意：实际部署时 Astro 会将文件打包到 _astro 目录中');
    lines.push('');
    
    // 生成 import 语句
    imageFiles.forEach((file) => {
      const base = path.basename(file);
      const hash = base.replace(/\.(webp|jpg|jpeg|png|gif|svg)$/i, '');
      lines.push(`import ${hash} from '../assets/strapi/${file}';`);
    });
    
    lines.push('');
    lines.push('export const STRAPI_IMAGE_URLS = {');
    imageFiles.forEach((file) => {
      const base = path.basename(file);
      const hash = base.replace(/\.(webp|jpg|jpeg|png|gif|svg)$/i, '');
      lines.push(`  '${base}': ${hash},`);
      lines.push(`  '${hash}': ${hash},`);
    });
    lines.push('};');
    // 不再生成 fallback（不带哈希的 /assets 原文件名），避免线上误用

    const modulePath = path.join(__dirname, '../src/data/strapi-image-urls.js');
    await fs.writeFile(modulePath, lines.join('\n'));

    console.log(`✅ 图片映射文件生成完成，包含 ${imageFiles.length} 个文件`);

  } catch (error) {
    console.warn('生成图片映射失败:', error.message);
  }
}

/**
 * 清理临时目录
 */
async function cleanupTempDir() {
  try {
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    // 忽略清理错误
  }
}

// 执行下载
downloadAllImages()
  .then(() => cleanupTempDir())
  .catch(error => {
    cleanupTempDir();
    process.exit(1);
  }); 