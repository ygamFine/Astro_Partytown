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
import { STRAPI_STATIC_URL } from '../src/lib/strapiClient.js';
import { getBannerData, getProducts, getNews, getCases, getMobileBottomMenu } from '../src/lib/strapi.js';
// 统一复用高层 API 获取语言列表，避免重复实现
import { getSupportedLanguages as fetchSupportedLanguages } from '../src/lib/strapi.js';
// 导入 homepageApi.js 中的数据获取功能
import { getAllHomepageData } from '../src/lib/homepageApi.js';

const execAsync = promisify(exec);

// 加载环境变量
import { config } from 'dotenv';
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从客户端导出的常量中获取配置（避免与其它模块重复定义）

// 下载到源码资产目录，便于打包进 _astro
const IMAGE_CACHE_DIR = process.env.IMAGE_CACHE_DIR || 'src/assets/strapi';

// Banner图片专用目录
const BANNER_IMAGE_DIR = path.join(IMAGE_CACHE_DIR, 'banner');

import { getSupportedLanguages } from '../src/lib/languageConfig.js';

// 动态获取启用的语言列表
async function getEnabledLocales() {
  return await getSupportedLanguages();
}

// 初始化语言列表
let ENABLED_LOCALES = [];

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

  // 确保banner目录存在
  try {
    await fs.access(BANNER_IMAGE_DIR);
  } catch {
    await fs.mkdir(BANNER_IMAGE_DIR, { recursive: true });
  }
}

/**
 * 自动整理现有的Banner图片到banner目录
 */
async function organizeExistingBannerImages() {

  // 确保必要的目录存在
  await ensureCacheDir();

  try {
    // 获取Banner图片URL列表来识别需要移动的文件
    const bannerUrls = new Set();

    // 获取Banner数据 - 直接提取所有图片URL，不依赖extractImageUrls函数
    try {
      const banners = await getBannerData();
      if (banners && Array.isArray(banners)) {
        banners.forEach(banner => {
          if (banner.image) bannerUrls.add(banner.image);
          if (banner.mobileImage && banner.mobileImage !== banner.image) {
            bannerUrls.add(banner.mobileImage);
          }
        });
      }
    } catch {}

    // 获取首页Banner数据 - 直接提取所有图片URL
    try {
      const homepageBanners = await getBannerData('homepage');
      if (homepageBanners && Array.isArray(homepageBanners)) {
        homepageBanners.forEach(banner => {
          if (banner.image) {
            bannerUrls.add(banner.image);
          }
          if (banner.mobileImage && banner.mobileImage !== banner.image) {
            bannerUrls.add(banner.mobileImage);
          }
        });
      }
    } catch {}

    if (bannerUrls.size === 0) {
      console.log('✅ 没有找到Banner数据');
      return;
    }

    // 获取所有Banner项目的完整数据，提取图片URL
    const allBannerImageUrls = new Set();

    // 普通Banner
    try {
      const banners = await getBannerData();
      if (banners && Array.isArray(banners)) {
        banners.forEach(banner => {
          if (banner.image) allBannerImageUrls.add(banner.image);
          if (banner.mobileImage && banner.mobileImage !== banner.image) {
            allBannerImageUrls.add(banner.mobileImage);
          }
        });
      }
    } catch {}

    // 首页Banner
    try {
      const homepageBanners = await getBannerData('homepage');
      if (homepageBanners && Array.isArray(homepageBanners)) {
        homepageBanners.forEach(banner => {
          if (banner.image) allBannerImageUrls.add(banner.image);
          if (banner.mobileImage && banner.mobileImage !== banner.image) {
            allBannerImageUrls.add(banner.mobileImage);
          }
        });
      }
    } catch {}

    // 检查主目录中的文件，看哪些对应Banner图片
    const files = await fs.readdir(IMAGE_CACHE_DIR);
    let movedCount = 0;
    let missingLocalBannerUrls = [];

    for (const url of allBannerImageUrls) {
      let fileName;

      if (url.startsWith('/assets/')) {
        // 本地路径：从路径中提取文件名
        const urlPath = new URL(url, 'http://dummy').pathname;
        fileName = path.basename(urlPath);
      } else if (url.startsWith('/uploads/') || url.startsWith('http')) {
        // 远程路径：生成WebP文件名
        fileName = generateImageFileName(url, true);
      } else {
        // 其他路径：跳过
        continue;
      }

      let fileExists = false;
      let sourcePath;

      if (url.startsWith('/assets/')) {
        // 本地路径：检查banner目录中是否存在
        sourcePath = path.join(BANNER_IMAGE_DIR, fileName);
        try {
          await fs.access(sourcePath);
          fileExists = true;
        } catch {
          // 文件不存在
        }
      } else {
        // 远程路径：检查主目录中是否存在
        sourcePath = path.join(IMAGE_CACHE_DIR, fileName);
        try {
          await fs.access(sourcePath);
          fileExists = true;
        } catch {
          // 文件不存在
        }
      }

      if (fileExists) {
        } else {
        // 文件不存在，需要下载
        // 对于远程URL，触发下载
        if (url.startsWith('/uploads/') || url.startsWith('http')) {
          try {
            await downloadImage(url, true);
            movedCount++;
          } catch (error) {
            }
        } else if (url.startsWith('/assets/')) {
          // 本地路径但文件不存在，收集起来后续处理
          missingLocalBannerUrls.push(url);
        }
      }
    }

    if (movedCount > 0) {
      } else {
      }

    // 检查是否有缺失的本地Banner图片
    if (missingLocalBannerUrls.length > 0) {
      }
  } catch (error) {
    }
}

// 导出函数以便单独测试
export { organizeExistingBannerImages };

// 单独的映射文件生成函数
export async function generateMappingOnly() {
  // 确保必要的目录存在
  await ensureCacheDir();
  await generateImageMapping();
}

/**
 * 生成图片文件名（WebP格式）
 */
function generateImageFileName(originalUrl, isBannerImage = false) {
  const baseUrl = STRAPI_STATIC_URL ;
  const url = new URL(originalUrl, baseUrl);
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
 * @param {string} imageUrl - 图片URL
 * @param {boolean} isBannerImage - 是否是Banner图片
 */
async function downloadImage(imageUrl, isBannerImage = false) {
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
    try {
      // 确定目标目录和文件名
      let targetDir, fileName;

      if (isBannerImage) {
        // Banner图片保持原始格式，不压缩，放在banner子目录
        targetDir = BANNER_IMAGE_DIR;
        const url = new URL(imageUrl, STRAPI_STATIC_URL);
        const pathname = url.pathname;
        const hash = generateImageHash(pathname);
        const originalExt = path.extname(pathname) || '.jpg';
        fileName = `${hash}${originalExt}`;
      } else {
        // 其他图片转换为WebP格式，放在主目录
        targetDir = IMAGE_CACHE_DIR;
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

      // 对于banner图片，如果文件存在也强制重新下载以确保原始质量
      if (isBannerImage && fileExists) {
        // 删除现有文件，强制重新下载
        try {
          await fs.unlink(localPath);
          fileExists = false;
        } catch (error) {
          }
      }

      // 如果是Banner图片且文件在目标目录不存在但在主目录存在，则移动到banner目录
      if (isBannerImage && !fileExists) {
        const mainDirPath = path.join(IMAGE_CACHE_DIR, fileName);
        try {
          await fs.access(mainDirPath);
          // 文件存在于主目录，移动到banner目录
          await fs.rename(mainDirPath, localPath);
          return fileName;
        } catch {
          // 文件在主目录中也不存在，需要下载
        }
      }

      if (fileExists && !isBannerImage) {
        return null; // 非banner图片且文件已存在，跳过
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
        if (!conversionSuccess) {
          }
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

  // 处理本地banner图片路径，重新下载
  if (imageUrl.startsWith('/assets/banner/')) {
    try {
      // 从API原始数据中找到对应的真实URL
      const bannerConfigPath = path.join(__dirname, '../src/data/banner-images.json');
      
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
      const targetDir = BANNER_IMAGE_DIR;
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
        `);

        // 如果是移动端图片下载失败，尝试使用PC端图片替代
        if (bannerConfigItem.type === 'mobile' && bannerConfigItem.fallbackImage) {
          const fallbackUrl = bannerConfigItem.fallbackImage.originalUrl.startsWith('http') ?
            bannerConfigItem.fallbackImage.originalUrl :
            `${STRAPI_STATIC_URL}${bannerConfigItem.fallbackImage.originalUrl}`;

          try {
            const fallbackResponse = await fetch(fallbackUrl);
            if (!fallbackResponse.ok) {
              `);
              return null;
            }

            const fallbackBuffer = await fallbackResponse.arrayBuffer();
            await fs.writeFile(localPath, Buffer.from(fallbackBuffer));

            return fileName;
          } catch (fallbackError) {
            return null;
          }
        }

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
    // 不再依赖文件名判断，使用调用时传入的isBannerImage参数
    const fullUrl = `${STRAPI_STATIC_URL}${imageUrl}`;

    `);
    return await downloadImage(fullUrl, isBannerImage);
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

  // 自动整理现有的Banner图片
  await organizeExistingBannerImages();

  // 获取语言列表
  if (ENABLED_LOCALES.length === 0) {
    ENABLED_LOCALES = await getEnabledLocales();
  }

  // 创建图片信息数组，记录每个图片的类型
  const imageInfoList = [];

  // 首先获取首页数据（使用 homepageApi.js 的功能）
  try {
    const allHomepageData = await getAllHomepageData();
    if (allHomepageData && allHomepageData.homepageData) {
      // 从首页数据中提取图片URL
      const homepageImageUrls = extractImageUrls(allHomepageData.homepageData);
      homepageImageUrls.forEach(url => {
        const isBanner = url.includes('banner') || url.includes('shouji') || url.includes('fengjing');
        imageInfoList.push({ url, isBanner, type: 'homepage' });
      });
      
      // 立即生成首页数据的图片索引
      await generateImageMapping();
    } else {
      }
  } catch (error) {
    }

  // 获取所有语言的数据（带分页）
  for (const locale of ENABLED_LOCALES) {
    try {
      // 产品（统一接口，原始结构 + 全量分页）
      const productsData = await getProducts({ locale, paginate: 'all', mode: 'raw' });
      extractImageUrls(productsData).forEach(url => {
        imageInfoList.push({ url, isBanner: false, type: 'product' });
      });

      // 新闻（统一接口，原始结构 + 全量分页）
      const newsData = await getNews({ locale, paginate: 'all', mode: 'raw' });
      extractImageUrls(newsData).forEach(url => {
        imageInfoList.push({ url, isBanner: false, type: 'news' });
      });

      // 案例（统一接口，原始结构 + 全量分页）
      const casesData = await getCases({ locale, paginate: 'all', mode: 'raw' });
      extractImageUrls(casesData).forEach(url => {
        imageInfoList.push({ url, isBanner: false, type: 'case' });
      });
    } catch (error) {
      // 静默处理错误
    }
  }

  // Banner图片现在通过智能识别逻辑处理，不需要在这里重复处理

  // 移动端底部菜单图标（按语言获取）
    /*
  for (const locale of ENABLED_LOCALES) {
    try {
      const mobileMenuData = await getMobileBottomMenu(locale);
      if (mobileMenuData && Array.isArray(mobileMenuData)) {
        const menuIconUrls = extractImageUrls({ data: mobileMenuData });
        中提取到`, menuIconUrls.length, '个图标 URL');
        menuIconUrls.forEach(url => {
          imageInfoList.push({ url, isBanner: false, type: 'mobile-menu' });
        });
      }
    } catch (error) {
      :`, error.message);
    }
  }
  */

  // 智能识别Banner图片：基于数据结构而不是文件名
  // 获取所有Banner数据（包括移动端图片）
  let allBannerData = [];
  try {
    // 获取普通Banner数据
    const commonBanners = await getBannerData('common');
    allBannerData = allBannerData.concat(commonBanners);

    // 获取首页Banner数据
    const homepageBanners = await getBannerData('homepage');
    allBannerData = allBannerData.concat(homepageBanners);

    // 从Banner数据中提取所有图片和视频URL
    const bannerImageUrls = new Set();
    allBannerData.forEach(banner => {
      // 添加视频（优先级最高）
      if (banner.shipin && banner.shipin !== '/images/placeholder.webp') {
        bannerImageUrls.add(banner.shipin);
        }
      // 添加桌面端图片
      if (banner.image && banner.image !== '/images/placeholder.webp') {
        bannerImageUrls.add(banner.image);
        }
      // 添加移动端图片
      if (banner.mobileImage && banner.mobileImage !== '/images/placeholder.webp' && banner.mobileImage !== banner.image) {
        bannerImageUrls.add(banner.mobileImage);
        }
    });

    // 将Banner图片添加到下载队列
    bannerImageUrls.forEach(url => {
      imageInfoList.push({ url, isBanner: true, type: 'banner' });
    });

  } catch (error) {
    // 如果获取Banner数据失败，回退到原来的方法
    }

  // 去重处理
  const uniqueImageMap = new Map();
  imageInfoList.forEach(info => {
    if (!uniqueImageMap.has(info.url)) {
      uniqueImageMap.set(info.url, info);
    } else {
      // 如果已经存在，优先保留Banner标识
      const existing = uniqueImageMap.get(info.url);
      if (info.isBanner && !existing.isBanner) {
        uniqueImageMap.set(info.url, info);
      }
    }
  });

  const uniqueImages = Array.from(uniqueImageMap.values());
  // 下载所有图片
  const downloadPromises = uniqueImages.map(info => downloadImage(info.url, info.isBanner));
  const results = await Promise.allSettled(downloadPromises);

  let totalDownloaded = 0;
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      totalDownloaded++;
    }
  });

  // 生成图片映射文件
  await generateImageMapping();

  // 生成Banner配置文件
  await generateBannerConfig();
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
      return;
    }

    // 获取实际存在的文件，包括banner子目录
    const files = [];
    const bannerDir = path.join(assetsImagesDir, 'banner');

    // 主目录文件
    try {
      const mainFiles = await fs.readdir(assetsImagesDir);
      mainFiles.forEach(file => {
        if (/\.(webp|jpg|jpeg|png|gif|svg|mp4|webm|mov)$/i.test(file)) {
          files.push(file);
        }
      });
    } catch (error) {
      // 忽略错误
    }

    // banner子目录文件
    try {
      const bannerFiles = await fs.readdir(bannerDir);
      bannerFiles.forEach(file => {
        if (/\.(webp|jpg|jpeg|png|gif|svg|mp4|webm|mov)$/i.test(file)) {
          files.push(path.join('banner', file));
        }
      });
    } catch (error) {
      // banner目录不存在，忽略错误
    }

    const imageFiles = files;

    // 1) 生成 JSON 映射（可供其它工具参考）
    const jsonMapping = {
      // 构建后实际可访问的资源前缀（Astro 会把导入的图片发射到 /assets）
      strapiImages: imageFiles.map(file => `/assets/${file}`),
      bannerImages: imageFiles.filter(file => file.startsWith('banner/')).map(file => `/assets/${file}`),
      webpImages: imageFiles.filter(file => file.endsWith('.webp')).map(file => `/assets/${file}`),
      totalCount: imageFiles.length,
      bannerCount: imageFiles.filter(file => file.startsWith('banner/')).length,
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

    // 生成 import 语句 - 去重处理
    const uniqueImports = new Map();
    imageFiles.forEach((file) => {
      const base = path.basename(file);
      const hash = base.replace(/\.(webp|jpg|jpeg|png|gif|svg|mp4|webm|mov)$/i, '');
      
      // 如果已经存在相同的hash，跳过重复导入
      if (!uniqueImports.has(hash)) {
        uniqueImports.set(hash, file);
        lines.push(`import ${hash} from '../assets/strapi/${file}';`);
      } else {
        })`);
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
      if (file.startsWith('banner/')) {
        const bannerPath = `/assets/${file}`;
        lines.push(`  '${file}': ${hash},`);
        lines.push(`  '${bannerPath}': ${hash},`);
      }
    });
    lines.push('};');
    // 不再生成 fallback（不带哈希的 /assets 原文件名），避免线上误用

    const modulePath = path.join(__dirname, '../src/data/strapi-image-urls.js');
    await fs.writeFile(modulePath, lines.join('\n'));

    } catch (error) {
    }
}

/**
 * 生成Banner图片配置文件
 */
async function generateBannerConfig() {
  try {
    const bannerImages = [];

    // 获取API原始数据来获取真实URL
    const { STRAPI_STATIC_URL } = await import('../src/lib/strapiClient.js');
    const apiUrl = `${STRAPI_STATIC_URL}/api/banner-setting?populate=all`;
    const response = await fetch(apiUrl);
    const apiData = await response.json();

    // 处理首页Banner
    if (apiData?.data?.field_shouyebanner) {
      apiData.data.field_shouyebanner.forEach(banner => {
        let desktopImage = null;
        let mobileImage = null;

        // 优先级1: field_bannershipin (权重最高)
        if (banner.field_bannershipin?.media?.url) {
          const shipinUrl = banner.field_bannershipin.media.url;
          const url = new URL(shipinUrl, STRAPI_STATIC_URL);
          const pathname = url.pathname;
          const hash = generateImageHash(pathname);
          const originalExt = path.extname(pathname) || '.mp4';
          const shipinImage = {
            originalUrl: shipinUrl,
            localPath: `src/assets/strapi/banner/${hash}${originalExt}`,
            type: 'shipin',
            bannerType: 'homepage',
            isBanner: true,
            priority: 1 // 最高优先级
          };
          bannerImages.push(shipinImage);
        }

        // 优先级2: field_tupian (桌面端图片)
        if (banner.field_tupian?.media?.url) {
          const imageUrl = banner.field_tupian.media.url;
          const imagePath = imageUrl.replace('/uploads/', '');
          desktopImage = {
            originalUrl: imageUrl,
            localPath: `src/assets/strapi/banner/L3VwbG9hZHMv${imagePath}`,
            type: 'desktop',
            bannerType: 'homepage',
            isBanner: true,
            priority: 2
          };
          bannerImages.push(desktopImage);
        }

        // 优先级3: field_shouji (移动端图片)
        if (banner.field_shouji?.media?.url) {
          const mobileImageUrl = banner.field_shouji.media.url;
          const mobileImagePath = mobileImageUrl.replace('/uploads/', '');
          mobileImage = {
            originalUrl: mobileImageUrl,
            localPath: `src/assets/strapi/banner/L3VwbG9hZHMv${mobileImagePath}`,
            type: 'mobile',
            bannerType: 'homepage',
            isBanner: true,
            priority: 3,
            fallbackImage: desktopImage // 记录对应的PC端图片
          };
          bannerImages.push(mobileImage);
        }
      });
    }

    // 处理通用Banner
    if (apiData?.data?.field_tongyongbanner) {
      apiData.data.field_tongyongbanner.forEach(banner => {
        let desktopImage = null;
        let mobileImage = null;

        // 优先级1: field_bannershipin (权重最高)
        if (banner.field_bannershipin?.media?.url) {
          const shipinUrl = banner.field_bannershipin.media.url;
          const url = new URL(shipinUrl, STRAPI_STATIC_URL);
          const pathname = url.pathname;
          const hash = generateImageHash(pathname);
          const originalExt = path.extname(pathname) || '.mp4';
          const shipinImage = {
            originalUrl: shipinUrl,
            localPath: `src/assets/strapi/banner/${hash}${originalExt}`,
            type: 'shipin',
            bannerType: 'common',
            isBanner: true,
            priority: 1 // 最高优先级
          };
          bannerImages.push(shipinImage);
        }

        // 优先级2: field_tupian (桌面端图片)
        if (banner.field_tupian?.media?.url) {
          const imageUrl = banner.field_tupian.media.url;
          const imagePath = imageUrl.replace('/uploads/', '');
          desktopImage = {
            originalUrl: imageUrl,
            localPath: `src/assets/strapi/banner/L3VwbG9hZHMv${imagePath}`,
            type: 'desktop',
            bannerType: 'common',
            isBanner: true,
            priority: 2
          };
          bannerImages.push(desktopImage);
        }

        // 优先级3: field_shouji (移动端图片)
        if (banner.field_shouji?.media?.url) {
          const mobileImageUrl = banner.field_shouji.media.url;
          const mobileImagePath = mobileImageUrl.replace('/uploads/', '');
          mobileImage = {
            originalUrl: mobileImageUrl,
            localPath: `src/assets/strapi/banner/L3VwbG9hZHMv${mobileImagePath}`,
            type: 'mobile',
            bannerType: 'common',
            isBanner: true,
            priority: 3,
            fallbackImage: desktopImage // 记录对应的PC端图片
          };
          bannerImages.push(mobileImage);
        }
      });
    }

    // 生成配置文件
    const configPath = path.join(__dirname, '../src/data/banner-images.json');
    
    // 确保目录存在
    const configDir = path.dirname(configPath);
    try {
      await fs.mkdir(configDir, { recursive: true });
    } catch (error) {
      }
    
    // 写入配置文件
    await fs.writeFile(configPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      bannerImages: bannerImages,
      totalCount: bannerImages.length
    }, null, 2));

    return bannerImages;
  } catch (error) {
    return [];
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

// 如果作为独立脚本运行，则执行整理功能
if (process.argv[1].endsWith('download-strapi-images.js') && process.argv[2] === '--organize-only') {
  organizeExistingBannerImages()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      process.exit(1);
    });
} else if (process.argv[1].endsWith('download-strapi-images.js') && process.argv[2] === '--generate-mapping') {
  generateMappingOnly()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      process.exit(1);
    });
} else {
  // 执行下载
  downloadAllImages()
    .then(() => cleanupTempDir())
    .catch(error => {
      cleanupTempDir();
      process.exit(1);
    });
} 