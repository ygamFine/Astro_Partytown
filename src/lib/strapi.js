// Strapi配置
const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://47.251.126.80';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21';

/**
 * 获取菜单数据
 */
export async function getMenus() {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 如果有token，添加认证头
    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }
    
    const response = await fetch(`${STRAPI_URL}/api/menus`, {
      headers,
    });
    
    if (!response.ok) {
      console.warn(`Strapi API调用失败: ${response.status} ${response.statusText}`);
      console.warn(`URL: ${STRAPI_URL}/api/menus`);
      
      // 尝试不同的endpoint
      if (response.status === 403 || response.status === 404) {
        console.log('尝试使用备用方案...');
        throw new Error(`API Error: ${response.status}`);
      }
      
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ 成功获取Strapi菜单数据');
    
    // 处理不同的Strapi返回格式
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.warn('API返回格式不正确:', data);
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('Strapi网络请求失败:', error.message);
    throw error; // 抛出错误而不是返回默认数据
  }
}

/**
 * 尝试不同的API endpoint
 */
export async function getMenusAlternative() {
  const alternatives = [
    '/api/menus?populate=*',
    '/api/menu-items',
    '/api/navigations',
  ];
  
  for (const endpoint of alternatives) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (STRAPI_TOKEN) {
        headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
      }
      
      const response = await fetch(`${STRAPI_URL}${endpoint}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ 成功使用备用endpoint: ${endpoint}`);
        return data.data || data;
      }
    } catch (error) {
      console.log(`❌ 备用endpoint失败: ${endpoint}`);
    }
  }
  
  throw new Error('所有API endpoints都失败了');
}

/**
 * 格式化菜单数据
 */
export function formatMenus(menus) {
  if (!Array.isArray(menus)) {
    console.error('菜单数据不是数组格式');
    throw new Error('Invalid menu data format');
  }
  
  return menus
    .filter(menu => {
      // Strapi 5 格式：直接检查publishedAt字段
      return menu.publishedAt !== null;
    })
    .sort((a, b) => {
      // 按id排序，如果有order字段可以改为order
      return (a.id || 0) - (b.id || 0);
    })
    .map(menu => ({
      id: menu.id,
      title: menu.name,  // Strapi 5使用name字段
      url: menu.path,    // Strapi 5使用path字段
      order: menu.id     // 使用id作为排序
    }));
}

/**
 * 获取菜单数据（智能重试）
 */
export async function getMenusWithFallback() {
  try {
    // 首先尝试主要API
    const menus = await getMenus();
    return menus;
  } catch (error) {
    console.log('🔄 主API失败，尝试备用endpoints...');
    // 如果主要API失败，尝试备用endpoints
    const menus = await getMenusAlternative();
    return menus;
  }
}

/**
 * 测试API连接
 */
export async function testConnection() {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }
    
    const response = await fetch(`${STRAPI_URL}/api/menus`, { headers });
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: `${STRAPI_URL}/api/menus`,
      hasToken: !!STRAPI_TOKEN
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: `${STRAPI_URL}/api/menus`,
      hasToken: !!STRAPI_TOKEN
    };
  }
} 