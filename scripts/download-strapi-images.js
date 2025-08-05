#!/usr/bin/env node

/**
 * Strapi 图片下载脚本
 * 在构建时下载所有Strapi API中的图片到本地
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateImageHash } from '../src/utils/hashUtils.js';

// 加载环境变量
import { config } from 'dotenv';
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量获取配置
const STRAPI_BASE_URL = process.env.STRAPI_API_URL;
const STRAPI_STATIC_URL = process.env.STRAPI_STATIC_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

const IMAGE_CACHE_DIR = process.env.IMAGE_CACHE_DIR || 'public/images/strapi';

// 从环境变量获取启用的语言
const ENABLED_LOCALES = process.env.ENABLED_LANGUAGES ? process.env.ENABLED_LANGUAGES.split(',') : [];



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
 * 生成图片文件名
 */
function generateImageFileName(originalUrl) {
  const url = new URL(originalUrl, STRAPI_STATIC_URL);
  const pathname = url.pathname;
  const ext = path.extname(pathname) || '.jpg';
  const hash = generateImageHash(pathname);
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
        return null;
      } catch {
        // 文件不存在，需要下载
      }

      // 下载图片
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return null;
      }

      const buffer = await response.arrayBuffer();
      await fs.writeFile(localPath, Buffer.from(buffer));
      
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
  
  const allImageUrls = new Set();
  let totalDownloaded = 0;
  
  // 获取所有语言的数据
  for (const locale of ENABLED_LOCALES) {
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
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file));
    
    const mapping = {
      strapiImages: imageFiles.map(file => `/images/strapi/${file}`),
      totalCount: imageFiles.length,
      generatedAt: new Date().toISOString()
    };
    
    const mappingPath = path.join(__dirname, '../src/data/strapi-image-mapping.json');
    await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));
  } catch (error) {
    // 静默处理错误
  }
}

// 执行下载
downloadAllImages().catch(error => {
  process.exit(1);
}); 