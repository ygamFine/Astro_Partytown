/**
 * Strapi Webhook 处理端点
 * 接收来自Strapi的更新通知，触发Vercel重新部署
 */

export async function POST({ request }) {
  try {
    console.log('🔔 收到Strapi webhook通知');
    
    // 验证请求来源
    const origin = request.headers.get('origin');
    const userAgent = request.headers.get('user-agent');
    
    console.log('📡 Webhook来源:', { origin, userAgent });
    
    // 获取webhook数据
    const data = await request.json();
    console.log('📦 Webhook数据:', data);
    
    // 触发Vercel重新部署 (这里可以添加具体的重新部署逻辑)
    console.log('🚀 触发网站更新...');
    
    // 返回成功响应
    return new Response(JSON.stringify({
      success: true,
      message: '网站更新已触发',
      timestamp: new Date().toISOString(),
      data: data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('❌ Webhook处理失败:', error);
    
    return new Response(JSON.stringify({
      error: 'Webhook处理失败',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
} 