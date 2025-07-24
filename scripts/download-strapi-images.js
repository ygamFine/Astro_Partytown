#!/usr/bin/env node

/**
 * Strapi 图片下载脚本
 * 在构建时下载所有Strapi API中的图片到本地
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
import { config } from 'dotenv';
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量获取配置
const STRAPI_BASE_URL = process.env.STRAPI_API_URL;
const STRAPI_STATIC_URL = process.env.STRAPI_STATIC_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const IMAGE_CACHE_DIR = process.env.IMAGE_CACHE_DIR;


// 从环境变量获取启用的语言
const ENABLED_LOCALES = process.env.ENABLED_LANGUAGES ? process.env.ENABLED_LANGUAGES.split(',') : [];

console.log('🌐 启用的语言:', ENABLED_LOCALES.join(', '));
console.log('🔧 配置信息:');
console.log('   - Strapi API URL:', STRAPI_BASE_URL);
console.log('   - Strapi Static URL:', STRAPI_STATIC_URL);
console.log('   - 图片缓存目录:', IMAGE_CACHE_DIR);
console.log('   - API Token:', STRAPI_TOKEN ? '已设置' : '未设置');

console.log('🚀 开始下载 Strapi 图片...');

/**
 * 确保缓存目录存在
 */
async function ensureCacheDir() {
  try {
    await fs.access(IMAGE_CACHE_DIR);
  } catch {
    await fs.mkdir(IMAGE_CACHE_DIR, { recursive: true });
    console.log('📁 创建图片缓存目录:', IMAGE_CACHE_DIR);
  }
}

/**
 * 生成图片文件名
 */
function generateImageFileName(originalUrl) {
  const url = new URL(originalUrl, STRAPI_STATIC_URL);
  const pathname = url.pathname;
  const ext = path.extname(pathname) || '.jpg';
  const hash = Buffer.from(pathname).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  return `${hash}${ext}`;
}

/**
 * 下载单个图片
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

      // 检查文件是否已存在
      try {
        await fs.access(localPath);
        console.log('⏭️  跳过已存在:', fileName);
        return null;
      } catch {
        // 文件不存在，需要下载
      }

      // 下载图片
      console.log('📥 下载图片:', imageUrl);
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.warn(`❌ 下载失败: ${imageUrl} (${response.status})`);
        return null;
      }

      const buffer = await response.arrayBuffer();
      await fs.writeFile(localPath, Buffer.from(buffer));
      
      const fileSize = buffer.byteLength;
      console.log(`✅ 下载成功: ${fileName} (${(fileSize / 1024).toFixed(1)}KB)`);
      return fileName;
    } catch (error) {
      console.error(`❌ 下载出错: ${imageUrl}`, error.message);
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
      if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/uploads/'))) {
        urls.push(value);
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'string' && (item.startsWith('http') || item.startsWith('/uploads/'))) {
            urls.push(item);
          } else if (typeof item === 'object' && item.url) {
            urls.push(item.url);
          }
        });
      } else if (typeof value === 'object' && value.url) {
        urls.push(value.url);
      } else if (typeof value === 'object') {
        extractFromObject(value);
      }
    }
  }
  
  extractFromObject(data);
  return [...new Set(urls)]; // 去重
}

/**
 * 获取所有数据并下载图片
 */
async function downloadAllImages() {
  await ensureCacheDir();
  
  const allImageUrls = new Set();
  let totalDownloaded = 0;
  
  // 获取所有语言的数据
  for (const locale of ENABLED_LOCALES) {
    console.log(`\n🌐 处理语言: ${locale}`);
    
    try {
      // 获取产品数据
      const productsResponse = await fetch(`${STRAPI_BASE_URL}/products?locale=${locale}&populate=*`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const productUrls = extractImageUrls(productsData);
        productUrls.forEach(url => allImageUrls.add(url));
        console.log(`📦 产品图片: ${productUrls.length} 个`);
      }
      
      // 获取新闻数据
      const newsResponse = await fetch(`${STRAPI_BASE_URL}/news?locale=${locale}&populate=*`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        const newsUrls = extractImageUrls(newsData);
        newsUrls.forEach(url => allImageUrls.add(url));
        console.log(`📰 新闻图片: ${newsUrls.length} 个`);
      }
      
      // 获取案例数据
      const casesResponse = await fetch(`${STRAPI_BASE_URL}/case?locale=${locale}&populate=*`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (casesResponse.ok) {
        const casesData = await casesResponse.json();
        const caseUrls = extractImageUrls(casesData);
        caseUrls.forEach(url => allImageUrls.add(url));
        console.log(`🏗️  案例图片: ${caseUrls.length} 个`);
      }
      
    } catch (error) {
      console.error(`❌ 获取 ${locale} 数据失败:`, error.message);
    }
  }
  
  console.log(`\n📊 总共发现 ${allImageUrls.size} 个唯一图片URL`);
  
  // 下载所有图片
  const downloadPromises = Array.from(allImageUrls).map(url => downloadImage(url));
  const results = await Promise.allSettled(downloadPromises);
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      totalDownloaded++;
    }
  });
  
  console.log(`\n🎉 下载完成！`);
  console.log(`📥 新下载: ${totalDownloaded} 个图片`);
  console.log(`📁 缓存目录: ${IMAGE_CACHE_DIR}`);
  
  // 生成图片映射文件
  await generateImageMapping();
}

/**
 * 生成图片映射文件
 */
async function generateImageMapping() {
  try {
    const files = await fs.readdir(IMAGE_CACHE_DIR);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file));
    
    const mapping = {
      strapiImages: imageFiles.map(file => `/images/strapi/${file}`),
      totalCount: imageFiles.length,
      generatedAt: new Date().toISOString()
    };
    
    const mappingPath = path.join(__dirname, '../src/data/strapi-image-mapping.json');
    await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));
    
    console.log(`📝 生成图片映射文件: ${mappingPath}`);
    console.log(`📊 映射图片数量: ${imageFiles.length}`);
  } catch (error) {
    console.error('❌ 生成图片映射失败:', error.message);
  }
}

// 执行下载
downloadAllImages().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
}); 