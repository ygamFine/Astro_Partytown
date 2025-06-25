export { renderers } from '../../renderers.mjs';

/**
 * Strapi API 代理端点
 * 解决客户端CORS跨域问题
 */

const prerender = false;

const STRAPI_BASE_URL = 'http://47.251.126.80/api';
const STRAPI_TOKEN = '2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21';

// 支持的endpoints映射
const ENDPOINT_MAP = {
  menus: '/menus',
  news: '/news',
  products: '/products', 
  company: '/company-info'
};

async function GET({ request, url }) {
  const searchParams = new URL(request.url).searchParams;
  const endpoint = searchParams.get('endpoint');
  
  // 验证endpoint
  if (!endpoint || !ENDPOINT_MAP[endpoint]) {
    return new Response(JSON.stringify({
      error: 'Invalid endpoint',
      supportedEndpoints: Object.keys(ENDPOINT_MAP)
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // 构建API URL
    const apiPath = ENDPOINT_MAP[endpoint];
    const apiUrl = new URL(`${STRAPI_BASE_URL}${apiPath}`);
    
    // 转发查询参数
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        apiUrl.searchParams.append(key, value);
      }
    });
    
    console.log(`🔄 代理请求: ${apiUrl.toString()}`);
    
    // 发起API请求
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Strapi API错误: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ 代理成功: ${endpoint}`);
    
    // 返回数据，添加CORS头
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error) {
    console.error(`❌ 代理请求失败 (${endpoint}):`, error);
    
    return new Response(JSON.stringify({
      error: 'API请求失败',
      message: error.message,
      endpoint: endpoint,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 处理OPTIONS预检请求
async function OPTIONS({ request }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  OPTIONS,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
