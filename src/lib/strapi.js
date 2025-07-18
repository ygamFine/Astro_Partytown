/**
 * Strapi 5 API 集成 - SSG模式直接访问
 * 构建时直接从API获取数据，图片自动下载到本地
 */

import { processProductImages, processSingleImage } from '../utils/imageDownloader.js';

const STRAPI_BASE_URL = 'http://47.251.126.80/api';
const STRAPI_STATIC_URL = 'http://47.251.126.80';
const STRAPI_TOKEN = '2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21';

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
    return getDefaultMenus(locale);
  }
}

/**
 * 获取默认菜单 (当API调用失败时使用)
 */
function getDefaultMenus(locale = 'en') {
  const menuTranslations = {
    'zh-CN': {
      home: '首页',
      about: '关于我们',
      products: '产品中心',
      case: '客户案例',
      news: '新闻中心',
      contact: '联系我们',
      allProducts: '全部产品',
      skidSteer: '滑移装载机',
      backhoe: '挖掘装载机',
      telescopic: '伸缩臂叉装车',
      electric: '电动工程机械'
    },
    'en': {
      home: 'Home',
      about: 'About',
      products: 'Products',
      case: 'Case',
      news: 'News',
      contact: 'Contact',
      allProducts: 'All Products',
      skidSteer: 'Skid Steer Loader',
      backhoe: 'Backhoe Loader',
      telescopic: 'Telescopic Handler',
      electric: 'Electric Machinery'
    }
  };

  const t = menuTranslations[locale] || menuTranslations['en'];

  return [
    { name: t.home, path: '/', locale },
    { name: t.about, path: '/about', locale },
    {
      name: t.products,
      path: '/products',
      locale,
      children: [
        { name: t.allProducts, path: '/products', locale },
        { name: t.skidSteer, path: '/products?category=滑移装载机', locale },
        { name: t.backhoe, path: '/products?category=挖掘装载机', locale },
        { name: t.telescopic, path: '/products?category=伸缩臂叉装车', locale },
        { name: t.electric, path: '/products?category=电动工程机械', locale }
      ]
    },
    { name: t.case, path: '/case', locale },
    { name: t.news, path: '/news', locale },
    { name: t.contact, path: '/contact', locale }
  ];
}

// SSG模式下不需要客户端实时更新，已删除getMenusClient方法

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

    // 处理所有产品的图片，下载到本地
    const processedProducts = [];
    for (const product of products) {
      const processedImages = await processProductImages(product.image);
      processedProducts.push({
        ...product,
        image: processedImages
      });
    }

    console.log(`从 Strapi API 获取到 ${processedProducts.length} 个产品`);
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
      console.log(`语言 ${locale} 没有找到产品 ${slug}`);
      return null;
    }

    const item = data.data[0];

    // 处理图片，下载到本地
    const processedImages = await processProductImages(item.imgs);
    
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
      slug: item.id,
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

    // 处理所有新闻的图片，下载到本地
    const processedNews = [];
    for (const newsItem of news) {
      const processedImage = await processSingleImage(newsItem.image);
      processedNews.push({
        ...newsItem,
        image: processedImage
      });
    }

    console.log(`从 Strapi API 获取到 ${processedNews.length} 条新闻`);
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
      console.log(`语言 ${locale} 没有找到新闻 ID: ${id}`);
      return null;
    }

    const item = data.data;

    // 处理图片，下载到本地
    const processedImage = await processSingleImage(item.zhanshitu && item.zhanshitu.length > 0 ? item.zhanshitu[0] : null);
    
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
        console.log(`案例 API 端点不存在，返回空数组`);
        return [];
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const cases = data.data?.map(item => ({
      id: item.id,
      slug: item.id,
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

    // 处理所有案例的图片，下载到本地
    const processedCases = [];
    for (const caseItem of cases) {
      const processedImage = await processSingleImage(caseItem.image);
      processedCases.push({
        ...caseItem,
        image: processedImage
      });
    }

    console.log(`从 Strapi API 获取到 ${processedCases.length} 个案例`);
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
    // 首先尝试直接通过 ID 获取
    let response = await fetch(`${STRAPI_BASE_URL}/case/${id}?locale=${locale}&populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    // 如果直接获取失败，尝试通过过滤条件获取
    if (!response.ok) {
      console.log(`直接获取案例 ${id} 失败，尝试通过过滤条件获取`);
      response = await fetch(`${STRAPI_BASE_URL}/case?filters[id][$eq]=${id}&locale=${locale}&populate=*`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`案例 API 端点不存在，返回 null`);
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // 处理不同的响应格式
    let item;
    if (Array.isArray(data.data)) {
      // 如果是数组格式（过滤查询的结果）
      if (data.data.length === 0) {
        console.log(`语言 ${locale} 没有找到案例 ID: ${id}`);
        return null;
      }
      item = data.data[0];
    } else {
      // 如果是单个对象格式（直接查询的结果）
      if (!data.data) {
        console.log(`语言 ${locale} 没有找到案例 ID: ${id}`);
        return null;
      }
      item = data.data;
    }

    // 将 Markdown 内容转换为 Strapi 富文本格式
    function convertMarkdownToRichText(markdown) {
      if (!markdown || typeof markdown !== 'string') {
        return [];
      }

      const blocks = [];
      const lines = markdown.split('\n');
      let currentBlock = null;

      for (const line of lines) {
        // 处理标题
        if (line.startsWith('#')) {
          const level = line.match(/^#+/)[0].length;
          const text = line.replace(/^#+\s*/, '');
          blocks.push({
            type: 'heading',
            level: Math.min(level, 6),
            children: [{ type: 'text', text }]
          });
        }
        // 处理图片
        else if (line.includes('![') && line.includes('](') && line.includes(')')) {
          const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (match) {
            const [, alt, url] = match;
            blocks.push({
              type: 'image',
              url: url.trim(),
              alt: alt.trim()
            });
          }
        }
        // 处理段落
        else if (line.trim()) {
          if (currentBlock && currentBlock.type === 'paragraph') {
            currentBlock.children.push({ type: 'text', text: line });
          } else {
            currentBlock = {
              type: 'paragraph',
              children: [{ type: 'text', text: line }]
            };
            blocks.push(currentBlock);
          }
        }
        // 空行结束当前段落
        else {
          currentBlock = null;
        }
      }

      return blocks;
    }

    // 处理图片，下载到本地
    const processedImage = await processSingleImage(item.image && item.image.length > 0 ? item.image[0] : null);
    
    // 转换为标准格式
    return {
      id: item.id,
      slug: item.id, // 使用 ID 作为 slug
      title: item.title,
      client: item.client,
      image: processedImage,
      excerpt: item.excerpt,
      category: item.category,
      date: item.publishedAt || item.createdAt,
      results: item.results || [],
      content: convertMarkdownToRichText(item.content),
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

