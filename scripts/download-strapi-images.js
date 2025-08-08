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

const execAsync = promisify(exec);

// 加载环境变量
import { config } from 'dotenv';
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量获取配置
const STRAPI_STATIC_URL = process.env.STRAPI_STATIC_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

const IMAGE_CACHE_DIR = process.env.IMAGE_CACHE_DIR || 'public/images/strapi';

// 从环境变量获取启用的语言，如果没有设置则从API获取
let ENABLED_LOCALES = process.env.ENABLED_LANGUAGES ? process.env.ENABLED_LANGUAGES.split(',') : [];

// 如果没有设置环境变量，从Strapi API获取支持的语言
async function getSupportedLanguages() {
  try {
    const response = await fetch(`${STRAPI_STATIC_URL}/api/i18n/locales`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const rawList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      
      const languages = rawList
        .map((item) => {
          const code = item?.code || item?.attributes?.code || item?.id || item?.locale || null;
          return code;
        })
        .filter(Boolean);

      return languages;
    }
  } catch (error) {
    console.log('⚠️  获取语言列表失败:', error.message);
  }
  
  // 如果API失败，使用默认语言列表
  return ['en', 'zh-CN', 'ja', 'de', 'fr', 'ar', 'es', 'it', 'pt-pt', 'nl', 'pl', 'ru', 'th', 'id', 'vi', 'ms', 'ml', 'my', 'hi', 'ko', 'tr'];
}


/**
 * 专门处理GIF文件的转换
 */
async function handleGifConversion(inputPath, outputPath, fileName) {
  console.log(`🔄 处理GIF文件: ${fileName}`);
  
  // 方法1: 使用sharp库处理GIF（推荐方法）
  try {
    await sharp(inputPath, { animated: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);
    console.log(`✅ Sharp GIF转换成功: ${fileName}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Sharp动画GIF转换失败，尝试静态处理: ${fileName}`);
  }
  
  // 方法2: 使用sharp处理静态GIF（只取第一帧）
  try {
    await sharp(inputPath, { pages: 1 })
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);
    console.log(`✅ Sharp静态GIF转换成功: ${fileName}`);
    return true;
  } catch (error) {
    console.log(`⚠️  Sharp静态GIF转换失败，尝试cwebp: ${fileName}`);
  }
  
  // 方法3: 使用cwebp转换（备用方法）
  try {
    await execAsync(`cwebp -q 80 -m 6 "${inputPath}" -o "${outputPath}"`);
    console.log(`✅ cwebp GIF转换成功: ${fileName}`);
    return true;
  } catch (error) {
    console.log(`⚠️  cwebp转换失败: ${fileName}`);
  }
  
  // 方法4: 保存原GIF文件作为回退
  try {
    const fallbackPath = outputPath.replace('.webp', '.gif');
    await fs.copyFile(inputPath, fallbackPath);
    console.log(`📋 已保存原GIF文件作为回退: ${fileName}`);
    return false;
  } catch (error) {
    console.log(`❌ 所有转换方法都失败: ${fileName}`);
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
      console.log(`⚠️  跳过无效文件: ${fileName}`);
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
        console.log(`✅ Sharp转换成功: ${fileName}`);
        return true;
      } catch (sharpError) {
        console.log(`⚠️  Sharp转换失败，尝试cwebp: ${fileName}`);
        
        // 回退到cwebp
        try {
          await execAsync(`cwebp -q 80 -m 6 "${inputPath}" -o "${outputPath}"`);
          console.log(`✅ cwebp转换成功: ${fileName}`);
          return true;
        } catch (cwebpError) {
          console.log(`❌ cwebp转换也失败: ${fileName}`);
          throw cwebpError;
        }
      }
    }
  } catch (error) {
    console.log(`❌ WebP转换失败: ${fileName}`);
    console.log(`错误信息: ${error.message}`);
    
    // 尝试保存原文件作为回退
    try {
      const ext = path.extname(inputPath);
      const fallbackPath = outputPath.replace('.webp', ext);
      await fs.copyFile(inputPath, fallbackPath);
      console.log(`📋 已保存原文件作为回退: ${fileName}`);
      return false;
    } catch (fallbackError) {
      console.log(`❌ 回退保存失败: ${fileName}`);
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

  // 如果是完整的Strapi URL
  if (imageUrl.startsWith(STRAPI_STATIC_URL)) {
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
    const fullUrl = `${STRAPI_STATIC_URL}${imageUrl}`;
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
    console.log('🔄 从Strapi API获取支持的语言列表...');
    ENABLED_LOCALES = await getSupportedLanguages();
    console.log(`📋 获取到 ${ENABLED_LOCALES.length} 种语言:`, ENABLED_LOCALES);
  }
  
  const allImageUrls = new Set();
  let totalDownloaded = 0;
  
  // 获取所有语言的数据
  for (const locale of ENABLED_LOCALES) {
    try {
      // 获取产品数据
      const productsResponse = await fetch(`${STRAPI_STATIC_URL}/api/products?locale=${locale}&populate=*`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const productUrls = extractImageUrls(productsData);
        productUrls.forEach(url => allImageUrls.add(url));
      }
      
      // 获取新闻数据
      const newsResponse = await fetch(`${STRAPI_STATIC_URL}/api/news?locale=${locale}&populate=*`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        const newsUrls = extractImageUrls(newsData);
        newsUrls.forEach(url => allImageUrls.add(url));
      }
      
      // 获取案例数据
      const casesResponse = await fetch(`${STRAPI_STATIC_URL}/api/case?locale=${locale}&populate=*`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (casesResponse.ok) {
        const casesData = await casesResponse.json();
        const caseUrls = extractImageUrls(casesData);
        caseUrls.forEach(url => allImageUrls.add(url));
      }
      
    } catch (error) {
      // 静默处理错误
    }
  }
  
  // 下载所有图片
  const downloadPromises = Array.from(allImageUrls).map(url => downloadImage(url));
  const results = await Promise.allSettled(downloadPromises);
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      totalDownloaded++;
    }
  });
  
  // 生成图片映射文件
  await generateImageMapping();
}

/**
 * 生成图片映射文件
 */
async function generateImageMapping() {
  try {
    const files = await fs.readdir(IMAGE_CACHE_DIR);
    const imageFiles = files.filter(file => /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(file));
    
    const mapping = {
      strapiImages: imageFiles.map(file => `/images/strapi/${file}`),
      webpImages: imageFiles.filter(file => file.endsWith('.webp')).map(file => `/images/strapi/${file}`),
      totalCount: imageFiles.length,
      webpCount: imageFiles.filter(file => file.endsWith('.webp')).length,
      generatedAt: new Date().toISOString()
    };
    
    const mappingPath = path.join(__dirname, '../src/data/strapi-image-mapping.json');
    await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));
    
    console.log(`📊 图片映射生成完成: ${mapping.webpCount}/${mapping.totalCount} 为WebP格式`);
  } catch (error) {
    console.log('⚠️  生成图片映射失败:', error.message);
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