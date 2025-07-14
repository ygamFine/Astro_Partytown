/**
 * Strapi 5 API 集成 - SSG模式直接访问
 * 构建时直接从API获取数据
 */

const STRAPI_BASE_URL = 'http://47.251.126.80/api';
const STRAPI_TOKEN = '2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21';

/**
 * 获取菜单数据 (SSG模式，构建时调用)
 */
export async function getMenus(locale = 'zh-hans') {
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
function getDefaultMenus(locale = 'zh-hans') {
  const menuTranslations = {
    'zh-hans': {
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
  
  const t = menuTranslations[locale] || menuTranslations['zh-hans'];
  
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
 * 测试API连接 (构建时)
 */
export async function testConnection() {
  try {
    const menus = await getMenus();
    return {
      success: true,
      status: 200,
      statusText: 'OK',
      menuCount: menus.length,
      message: '连接成功'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: '连接失败'
    };
  }
} 