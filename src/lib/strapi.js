/**
 * Strapi 5 API 集成 - SSG模式直接访问
 * 构建时直接从API获取数据，图片自动下载到本地
 */

import { generateImageHash } from '../utils/hashUtils.js';

// 加载图片映射文件的通用函数
async function loadImageMappingWithCreate() {
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

// 加载环境变量
import { config } from 'dotenv';
config();

// 从环境变量获取 Strapi 配置
const STRAPI_BASE_URL = process.env.STRAPI_API_URL;
const STRAPI_STATIC_URL = process.env.STRAPI_STATIC_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

// 验证环境变量
if (!STRAPI_BASE_URL || !STRAPI_STATIC_URL || !STRAPI_TOKEN) {
  console.error('❌ 缺少必要的环境变量:');
  console.error('   STRAPI_API_URL:', STRAPI_BASE_URL ? '已设置' : '未设置');
  console.error('   STRAPI_STATIC_URL:', STRAPI_STATIC_URL ? '已设置' : '未设置');
  console.error('   STRAPI_API_TOKEN:', STRAPI_TOKEN ? '已设置' : '未设置');
  throw new Error('缺少必要的 Strapi 环境变量配置');
}

/**
 * 统一的图片处理函数 - 用于替换重复的图片处理逻辑
 */
function processImageWithMapping(img, imageMapping) {
  if (typeof img === 'string') {
    // 如果已经是本地缓存路径，直接返回
    if (img.startsWith('/images/strapi/')) {
      return img;
    }
    // 如果是外部URL，尝试在缓存中找到对应的本地文件
    if (img.startsWith('http')) {
      const urlHash = generateImageHash(img);
      const cachedImage = imageMapping.strapiImages?.find((cached) => 
        cached.includes(urlHash) || cached.includes(img.split('/').pop())
      );
      return cachedImage || img;
    }
    return img;
  } else if (img && typeof img === 'object' && img.url) {
    // 如果是图片对象，提取URL并映射到本地缓存
    const originalUrl = img.url;
    if (originalUrl.startsWith('/uploads/')) {
      // 这是Strapi的本地图片，尝试在缓存中找到对应的文件
      const fileName = originalUrl.split('/').pop();
      
      // 尝试多种匹配方式
      const cachedImage = imageMapping.strapiImages?.find((cached) => {
        // 1. 直接匹配文件名
        if (cached.includes(fileName)) return true;
        
        // 2. 匹配hash
        if (img.hash && cached.includes(img.hash)) return true;
        
        // 3. Base64编码匹配
        try {
          const encodedName = Buffer.from(fileName).toString('base64');
          if (cached.includes(encodedName)) return true;
          // 处理Base64填充字符
          const encodedNameNoPadding = encodedName.replace(/=+$/, '');
          if (cached.includes(encodedNameNoPadding)) return true;
        } catch (e) {}
        
        // 4. Base64解码匹配
        try {
          const decodedName = Buffer.from(fileName, 'base64').toString();
          if (cached.includes(decodedName)) return true;
        } catch (e) {}
        
        return false;
      });
      
      return cachedImage || originalUrl;
    }
    return originalUrl;
  }
  
  return null;
}

/**
 * 获取菜单数据 (SSG模式，构建时调用)
 */
export async function getMenus(locale = 'en') {
  try {
    const response = await fetch(`${STRAPI_BASE_URL}/menus?locale=${locale}&populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // 转换为标准格式，支持国际化字段
    const menus = data.data?.map(item => ({
      name: item.name || item.attributes?.name,
      path: item.path || item.attributes?.path,
      locale: item.locale || item.attributes?.locale,
      publishedAt: item.publishedAt || item.attributes?.publishedAt,
      // 支持多语言子菜单
      children: item.children || item.attributes?.children || []
    })) || [];

    return menus;

  } catch (error) {
    // 如果API调用失败，返回默认菜单
    return []
  }
}

/**
 * 获取产品列表 (SSG模式，构建时调用)
 */
export async function getProducts(locale = 'en') {
  try {
    // 只获取指定语言的数据，不回退到其他语言
    const response = await fetch(`${STRAPI_BASE_URL}/products?locale=${locale}&populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.data?.map(item => ({
      id: item.id,
      slug: item.slug,
      name: item.Title,
      category: item.cate?.name || item.category,
      image: item.imgs || ['/images/placeholder.webp'],
      price: item.price,
      excerpt: item.info?.[0]?.content || item.excerpt,
      specs: item.specs || [],
      features: item.features || [],
      gallery: [],
      locale: item.locale,
      publishedAt: item.publishedAt
    })) || [];

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理所有产品的图片，使用缓存的图片
    const processedProducts = [];
    for (const product of products) {
      let processedImages = ['/images/placeholder.webp'];
      
      if (product.image && Array.isArray(product.image) && product.image.length > 0) {
        // 处理图片数组，提取URL并映射到本地缓存
        const processedImageUrls = product.image
          .map(img => processImageWithMapping(img, imageMapping))
          .filter(img => img !== null);
        
        if (processedImageUrls.length > 0) {
          processedImages = processedImageUrls;
        }
      }
      
      processedProducts.push({
        ...product,
        image: processedImages
      });
    }


    return processedProducts;

  } catch (error) {
    console.error('获取产品列表失败:', error);
    // 如果API调用失败，返回空数组
    return [];
  }
}

/**
 * 获取单个产品详情 (SSG模式，构建时调用)
 */
export async function getProduct(slug, locale = 'en') {
  try {
    // 只获取指定语言的数据，不回退到其他语言
    const response = await fetch(`${STRAPI_BASE_URL}/products?filters[slug][$eq]=${slug}&locale=${locale}&populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // 如果没有找到数据，直接返回 null
    if (!data.data || data.data.length === 0) {
  
      return null;
    }

    const item = data.data[0];

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理图片，使用缓存的图片映射
    const processedImages = [];
    if (item.imgs && Array.isArray(item.imgs)) {
      for (const img of item.imgs) {
        if (typeof img === 'string') {
          // 如果已经是本地缓存路径，直接使用
          if (img.startsWith('/images/strapi/')) {
            processedImages.push(img);
            continue;
          }
          // 如果是外部URL，尝试在缓存中找到对应的本地文件
          if (img.startsWith('http')) {
            const urlHash = generateImageHash(img);
            const cachedImage = imageMapping.strapiImages?.find((cached) => 
              cached.includes(urlHash) || cached.includes(img.split('/').pop())
            );
            if (cachedImage) {
              processedImages.push(cachedImage);
            } else {
              processedImages.push(img);
            }
          } else {
            processedImages.push(img);
          }
        } else if (img && typeof img === 'object' && img.url) {
          // 如果是图片对象，提取URL并映射到本地缓存
          const originalUrl = img.url;
          if (originalUrl.startsWith('/uploads/')) {
            // 这是Strapi的本地图片，尝试在缓存中找到对应的文件
            const fileName = originalUrl.split('/').pop();
            
            // 尝试多种匹配方式
            const cachedImage = imageMapping.strapiImages?.find((cached) => {
              // 1. 直接匹配文件名
              if (cached.includes(fileName)) return true;
              
              // 2. 匹配hash
              if (img.hash && cached.includes(img.hash)) return true;
              
              // 3. Base64编码匹配
              try {
                const encodedName = Buffer.from(fileName).toString('base64');
                if (cached.includes(encodedName)) return true;
                // 处理Base64填充字符
                const encodedNameNoPadding = encodedName.replace(/=+$/, '');
                if (cached.includes(encodedNameNoPadding)) return true;
              } catch (e) {}
              
              // 4. Base64解码匹配
              try {
                const decodedName = Buffer.from(fileName, 'base64').toString();
                if (cached.includes(decodedName)) return true;
              } catch (e) {}
              
              return false;
            });
            
            if (cachedImage) {
              processedImages.push(cachedImage);
            } else {
              processedImages.push(originalUrl);
            }
          } else {
            processedImages.push(originalUrl);
          }
        }
      }
    }
    
    // 如果没有处理到任何图片，使用占位符
    if (processedImages.length === 0) {
      processedImages.push('/images/placeholder.webp');
    }
    
    // 转换为标准格式
    return {
      id: item.id,
      slug: item.slug,
      name: item.Title,
      category: item.cate?.name || item.category,
      image: processedImages,
      price: item.price,
      excerpt: item.info?.[0]?.content || item.excerpt,
      info: item.info || [], // 保留完整的 info 字段用于富文本显示
      specs: item.specs || [],
      features: item.features || [],
      gallery: [],
      locale: item.locale,
      publishedAt: item.publishedAt
    };

  } catch (error) {
    console.error('获取产品详情失败:', error);
    return null;
  }
}

/**
 * 获取新闻列表 (SSG模式，构建时调用)
 */
export async function getNews(locale = 'en') {
  try {
    // 只获取指定语言的数据，不回退到其他语言
    const response = await fetch(`${STRAPI_BASE_URL}/news?locale=${locale}&populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const news = data.data?.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      image: item.zhanshitu && item.zhanshitu.length > 0 ? item.zhanshitu[0] : null,
      date: item.publishedAt || item.createdAt,
      author: item.author,
      category: item.category,
      tags: item.tags || [],
      locale: item.locale,
      publishedAt: item.publishedAt
    })) || [];

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理所有新闻的图片，使用缓存的图片
    const processedNews = [];
    for (const newsItem of news) {
      let processedImage = '/images/placeholder.webp';
      
      if (newsItem.image) {
        if (typeof newsItem.image === 'string') {
          // 如果是字符串URL，尝试在缓存中找到对应的本地文件
          if (newsItem.image.startsWith('http')) {
            const urlHash = generateImageHash(newsItem.image);
            const cachedImage = imageMapping.strapiImages?.find(cached => 
              cached.includes(urlHash) || cached.includes(newsItem.image.split('/').pop())
            );
            processedImage = cachedImage || newsItem.image;
          } else {
            processedImage = newsItem.image;
          }
        } else if (newsItem.image && typeof newsItem.image === 'object' && newsItem.image.url) {
          // 如果是图片对象，提取URL并映射到本地缓存
          const originalUrl = newsItem.image.url;
          if (originalUrl.startsWith('/uploads/')) {
            // 这是Strapi的本地图片，尝试在缓存中找到对应的文件
            const fileName = originalUrl.split('/').pop();
            
            // 尝试多种匹配方式
            const cachedImage = imageMapping.strapiImages?.find(cached => {
              // 1. 直接匹配文件名
              if (cached.includes(fileName)) return true;
              
              // 2. 匹配hash
              if (newsItem.image.hash && cached.includes(newsItem.image.hash)) return true;
              
              // 3. Base64编码匹配
              try {
                const encodedName = Buffer.from(fileName).toString('base64');
                if (cached.includes(encodedName)) return true;
                // 处理Base64填充字符
                const encodedNameNoPadding = encodedName.replace(/=+$/, '');
                if (cached.includes(encodedNameNoPadding)) return true;
              } catch (e) {}
              
              // 4. Base64解码匹配
              try {
                const decodedName = Buffer.from(fileName, 'base64').toString();
                if (cached.includes(decodedName)) return true;
              } catch (e) {}
              
              return false;
            });
            
            processedImage = cachedImage || originalUrl;
          } else {
            processedImage = originalUrl;
          }
        }
      }
      
      processedNews.push({
        ...newsItem,
        image: processedImage
      });
    }


    return processedNews;

  } catch (error) {
    console.error('获取新闻列表失败:', error);
    // 如果API调用失败，返回空数组
    return [];
  }
}

/**
 * 获取单个新闻详情 (SSG模式，构建时调用)
 */
export async function getNewsById(id, locale = 'en') {
  try {
    // 只获取指定语言的数据，不回退到其他语言
    const response = await fetch(`${STRAPI_BASE_URL}/news/${id}?locale=${locale}&populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // 如果没有找到数据，直接返回 null
    if (!data.data) {
  
      return null;
    }

    const item = data.data;

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理图片，使用缓存的图片
    let processedImage = '/images/placeholder.webp';
    const originalImage = item.zhanshitu && item.zhanshitu.length > 0 ? item.zhanshitu[0] : null;
    
    if (originalImage) {
      if (typeof originalImage === 'string') {
        // 如果是字符串URL，尝试在缓存中找到对应的本地文件
        if (originalImage.startsWith('http')) {
          const urlHash = generateImageHash(originalImage);
          const cachedImage = imageMapping.strapiImages?.find(cached => 
            cached.includes(urlHash) || cached.includes(originalImage.split('/').pop())
          );
          processedImage = cachedImage || originalImage;
        } else {
          processedImage = originalImage;
        }
      } else if (originalImage && typeof originalImage === 'object' && originalImage.url) {
        // 如果是图片对象，提取URL并映射到本地缓存
        const originalUrl = originalImage.url;
        if (originalUrl.startsWith('/uploads/')) {
          // 这是Strapi的本地图片，尝试在缓存中找到对应的文件
          const fileName = originalUrl.split('/').pop();
          
          // 尝试多种匹配方式
          const cachedImage = imageMapping.strapiImages?.find(cached => {
            // 1. 直接匹配文件名
            if (cached.includes(fileName)) return true;
            
            // 2. 匹配hash
            if (originalImage.hash && cached.includes(originalImage.hash)) return true;
            
            // 3. Base64编码匹配
            try {
              const encodedName = Buffer.from(fileName).toString('base64');
              if (cached.includes(encodedName)) return true;
              // 处理Base64填充字符
              const encodedNameNoPadding = encodedName.replace(/=+$/, '');
              if (cached.includes(encodedNameNoPadding)) return true;
            } catch (e) {}
            
            // 4. Base64解码匹配
            try {
              const decodedName = Buffer.from(fileName, 'base64').toString();
              if (cached.includes(decodedName)) return true;
            } catch (e) {}
            
            return false;
          });
          
          processedImage = cachedImage || originalUrl;
        } else {
          processedImage = originalUrl;
        }
      }
    }
    
    // 转换为标准格式
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      image: processedImage,
      date: item.publishedAt || item.createdAt,
      author: item.author,
      category: item.category,
      tags: item.tags || [],
      locale: item.locale,
      publishedAt: item.publishedAt
    };

  } catch (error) {
    console.error('获取新闻详情失败:', error);
    return null;
  }
}

/**
 * 获取案例列表 (SSG模式，构建时调用)
 */
export async function getCases(locale = 'en') {
  try {
    // 只获取指定语言的数据，不回退到其他语言
    const response = await fetch(`${STRAPI_BASE_URL}/case?locale=${locale}&populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
    
        return [];
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const cases = data.data?.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      client: item.client,
      image: item.image && item.image.length > 0 ? item.image[0] : null,
      excerpt: item.excerpt,
      category: item.category,
      date: item.publishedAt || item.createdAt,
      results: item.results || [],
      content: item.content,
      industry: item.industry,
      location: item.location,
      completionDate: item.completionDate,
      equipmentUsed: item.equipmentUsed,
      projectDuration: item.projectDuration,
      locale: item.locale,
      publishedAt: item.publishedAt
    })) || [];

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理所有案例的图片，使用缓存的图片
    const processedCases = [];
    for (const caseItem of cases) {
      let processedImage = '/images/placeholder.webp';
      
      if (caseItem.image) {
        if (typeof caseItem.image === 'string') {
          // 如果是字符串URL，尝试在缓存中找到对应的本地文件
          if (caseItem.image.startsWith('http')) {
            const urlHash = generateImageHash(caseItem.image);
            const cachedImage = imageMapping.strapiImages?.find(cached => 
              cached.includes(urlHash) || cached.includes(caseItem.image.split('/').pop())
            );
            processedImage = cachedImage || caseItem.image;
          } else {
            processedImage = caseItem.image;
          }
        } else if (caseItem.image && typeof caseItem.image === 'object' && caseItem.image.url) {
          // 如果是图片对象，提取URL并映射到本地缓存
          const originalUrl = caseItem.image.url;
          if (originalUrl.startsWith('/uploads/')) {
            // 这是Strapi的本地图片，尝试在缓存中找到对应的文件
            const fileName = originalUrl.split('/').pop();
            
            // 尝试多种匹配方式
            const cachedImage = imageMapping.strapiImages?.find(cached => {
              // 1. 直接匹配文件名
              if (cached.includes(fileName)) return true;
              
              // 2. 匹配hash
              if (caseItem.image.hash && cached.includes(caseItem.image.hash)) return true;
              
              // 3. Base64编码匹配
              try {
                const encodedName = Buffer.from(fileName).toString('base64');
                if (cached.includes(encodedName)) return true;
                // 处理Base64填充字符
                const encodedNameNoPadding = encodedName.replace(/=+$/, '');
                if (cached.includes(encodedNameNoPadding)) return true;
              } catch (e) {}
              
              // 4. Base64解码匹配
              try {
                const decodedName = Buffer.from(fileName, 'base64').toString();
                if (cached.includes(decodedName)) return true;
              } catch (e) {}
              
              return false;
            });
            
            processedImage = cachedImage || originalUrl;
          } else {
            processedImage = originalUrl;
          }
        }
      }
      
      processedCases.push({
        ...caseItem,
        image: processedImage
      });
    }


    return processedCases;

  } catch (error) {
    console.error('获取案例列表失败:', error);
    // 如果API调用失败，返回空数组
    return [];
  }
}

/**
 * 获取单个案例详情 (SSG模式，构建时调用)
 */
export async function getCase(id, locale = 'en') {
  try {
    // 只获取指定语言的数据，不回退到其他语言
    const response = await fetch(`${STRAPI_BASE_URL}/case/${id}?locale=${locale}&populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
    
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // 如果没有找到数据，直接返回 null
    if (!data.data) {
  
      return null;
    }

    const item = data.data;

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理图片，使用缓存的图片
    let processedImage = '/images/placeholder.webp';
    const originalImage = item.image && item.image.length > 0 ? item.image[0] : null;
    
    if (originalImage) {
      if (typeof originalImage === 'string') {
        // 如果是字符串URL，尝试在缓存中找到对应的本地文件
        if (originalImage.startsWith('http')) {
          const urlHash = generateImageHash(originalImage);
          const cachedImage = imageMapping.strapiImages?.find(cached => 
            cached.includes(urlHash) || cached.includes(originalImage.split('/').pop())
          );
          processedImage = cachedImage || originalImage;
        } else {
          processedImage = originalImage;
        }
      } else if (originalImage && typeof originalImage === 'object' && originalImage.url) {
        // 如果是图片对象，提取URL并映射到本地缓存
        const originalUrl = originalImage.url;
        if (originalUrl.startsWith('/uploads/')) {
          // 这是Strapi的本地图片，尝试在缓存中找到对应的文件
          const fileName = originalUrl.split('/').pop();
          
          // 尝试多种匹配方式
          const cachedImage = imageMapping.strapiImages?.find(cached => {
            // 1. 直接匹配文件名
            if (cached.includes(fileName)) return true;
            
            // 2. 匹配hash
            if (originalImage.hash && cached.includes(originalImage.hash)) return true;
            
            // 3. Base64编码匹配
            try {
              const encodedName = Buffer.from(fileName).toString('base64');
              if (cached.includes(encodedName)) return true;
              // 处理Base64填充字符
              const encodedNameNoPadding = encodedName.replace(/=+$/, '');
              if (cached.includes(encodedNameNoPadding)) return true;
            } catch (e) {}
            
            // 4. Base64解码匹配
            try {
              const decodedName = Buffer.from(fileName, 'base64').toString();
              if (cached.includes(decodedName)) return true;
            } catch (e) {}
            
            return false;
          });
          
          processedImage = cachedImage || originalUrl;
        } else {
          processedImage = originalUrl;
        }
      }
    }
    
    // 转换为标准格式
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      client: item.client,
      image: processedImage,
      excerpt: item.excerpt,
      category: item.category,
      date: item.publishedAt || item.createdAt,
      results: item.results || [],
      content: item.content,
      industry: item.industry,
      location: item.location,
      completionDate: item.completionDate,
      equipmentUsed: item.equipmentUsed,
      projectDuration: item.projectDuration,
      locale: item.locale,
      publishedAt: item.publishedAt
    };

  } catch (error) {
    console.error('获取案例详情失败:', error);
    return null;
  }
}

