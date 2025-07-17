/**
 * Strapi 5 API 集成 - SSG模式直接访问
 * 构建时直接从API获取数据
 */

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
      image: item.imgs?.map(img => STRAPI_STATIC_URL + (img.formats?.thumbnail?.url || img.url)) || ['/images/placeholder.webp'],
      price: item.price,
      excerpt: item.info?.[0]?.content || item.excerpt,
      specs: item.specs || [],
      features: item.features || [],
      gallery: [],
      locale: item.locale,
      publishedAt: item.publishedAt
    })) || [];
    
    console.log(`从 Strapi API 获取到 ${products.length} 个产品`);
    return products;
    
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
    console.log('获取到产品详情的源数据', data.data);
    
    // 如果没有找到数据，直接返回 null
    if (!data.data || data.data.length === 0) {
      console.log(`语言 ${locale} 没有找到产品 ${slug}`);
      return null;
    }
    
    const item = data.data[0];
    console.log('获取到产品详情的源数据富文本内容', JSON.stringify(item.info));
    
    // 转换为标准格式
    return {
      id: item.id,
      slug: item.slug,
      name: item.Title,
      category: item.cate?.name || item.category,
      image: item.imgs?.map(img => STRAPI_STATIC_URL + (img?.url || img.url)) || ['/images/placeholder.webp'],
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

 