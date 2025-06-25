/**
 * Strapi 5 API 集成 - SSG模式直接访问
 * 构建时直接从API获取数据
 */

const STRAPI_BASE_URL = 'http://47.251.126.80/api';
const STRAPI_TOKEN = '2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21';

/**
 * 获取菜单数据 (SSG模式，构建时调用)
 */
export async function getMenus() {
  try {
    console.log('🔄 构建时获取菜单数据...');
    
    const response = await fetch(`${STRAPI_BASE_URL}/menus`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 转换为标准格式
    const menus = data.data?.map(item => ({
      name: item.name,
      path: item.path,
      publishedAt: item.publishedAt
    })) || [];
    
    console.log(`✅ 构建时获取到 ${menus.length} 个菜单项`);
    return menus;
    
  } catch (error) {
    console.error('❌ 构建时获取菜单失败:', error);
    throw error;
  }
}

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