/**
 * Strapi API 代理端点
 * 解决CORS问题，支持客户端动态更新菜单数据
 */

const STRAPI_BASE_URL = 'http://47.251.126.80/api';
const STRAPI_TOKEN = '2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21';

export async function GET({ url }) {
  try {
    // 获取查询参数
    const searchParams = new URL(url).searchParams;
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return new Response(JSON.stringify({ 
        error: '缺少endpoint参数' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    // 构建Strapi API URL
    const strapiUrl = `${STRAPI_BASE_URL}/${endpoint}`;
    
    console.log(`🔄 代理请求: ${strapiUrl}`);
    
    // 发送请求到Strapi
    const response = await fetch(strapiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Strapi API错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 根据不同端点处理数据格式
    let processedData;
    
    switch (endpoint) {
      case 'menus':
        processedData = data.data?.map(item => ({
          name: item.name,
          path: item.path,
          publishedAt: item.publishedAt
        })) || [];
        break;
        
      case 'news':
        processedData = data.data?.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          content: item.content,
          excerpt: item.excerpt,
          publishedAt: item.publishedAt,
          image: item.image
        })) || [];
        break;
        
      case 'products':
        processedData = data.data?.map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: item.price,
          publishedAt: item.publishedAt,
          images: item.images
        })) || [];
        break;
        
      case 'company':
        processedData = data.data || {};
        break;
        
      default:
        processedData = data.data || [];
    }
    
    console.log(`✅ 代理成功: ${endpoint}, 返回 ${Array.isArray(processedData) ? processedData.length : 1} 条数据`);
    
    return new Response(JSON.stringify(processedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ 代理请求失败:', error);
    
    return new Response(JSON.stringify({ 
      error: '代理请求失败',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

// 处理OPTIONS预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
} 