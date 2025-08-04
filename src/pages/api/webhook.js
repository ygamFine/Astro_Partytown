export async function POST(request) {
  try {
    const body = await request.json();
    const { event, entry } = body;

    // 验证webhook密钥（如果设置了）
    const webhookSecret = process.env.STRAPI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-strapi-signature');
      if (signature !== webhookSecret) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // 根据事件类型决定重新验证哪些页面
    let pathsToRevalidate = [];

    if (event === 'entry.publish' || event === 'entry.update') {
      const contentType = entry?.collectionName || entry?.modelName;
      
      switch (contentType) {
        case 'product':
        case 'products':
          // 重新验证产品相关页面
          pathsToRevalidate = [
            '/en/products',
            '/zh-CN/products',
            `/en/products/${entry.slug || entry.id}`,
            `/zh-CN/products/${entry.slug || entry.id}`
          ];
          break;
          
        case 'news':
        case 'new':
          // 重新验证新闻相关页面
          pathsToRevalidate = [
            '/en/news',
            '/zh-CN/news',
            `/en/news/${entry.slug || entry.id}`,
            `/zh-CN/news/${entry.slug || entry.id}`
          ];
          break;
          
        case 'case':
        case 'cases':
          // 重新验证案例相关页面
          pathsToRevalidate = [
            '/en/case',
            '/zh-CN/case',
            `/en/case/${entry.id}`,
            `/zh-CN/case/${entry.id}`
          ];
          break;
          
        default:
          // 重新验证首页
          pathsToRevalidate = ['/en', '/zh-CN'];
      }
    }

    // 触发重新验证
    const revalidationPromises = pathsToRevalidate.map(async (path) => {
      try {
        const revalidateUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/revalidate?token=${process.env.BYPASS_TOKEN}&path=${encodeURIComponent(path)}`;
        await fetch(revalidateUrl, { method: 'POST' });
        console.log(`Revalidated: ${path}`);
      } catch (error) {
        console.error(`Failed to revalidate ${path}:`, error);
      }
    });

    await Promise.all(revalidationPromises);

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

export async function GET(request) {
  return new Response('Webhook endpoint', { status: 200 });
} 