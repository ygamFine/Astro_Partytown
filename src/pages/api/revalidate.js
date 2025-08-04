export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const path = searchParams.get('path');

  // 验证绕过令牌
  if (token !== process.env.BYPASS_TOKEN) {
    return new Response('Invalid token', { status: 401 });
  }

  if (!path) {
    return new Response('Missing path', { status: 400 });
  }

  try {
    // 触发重新验证
    await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}${path}`, {
      method: 'GET',
      headers: {
        'x-vercel-revalidate': '1',
      },
    });

    return new Response('Revalidated', { status: 200 });
  } catch (error) {
    return new Response('Error revalidating', { status: 500 });
  }
}

export async function GET(request) {
  return new Response('Revalidation endpoint', { status: 200 });
} 