import type { APIRoute } from 'astro';

// 禁用预渲染，确保API在服务器端运行
export const prerender = false;

// 统一的请求处理函数
const handleProxyRequest = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  let targetUrl = url.searchParams.get('url');
  
  // 对于POST请求，目标URL可能在请求体中
  if (!targetUrl && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
    try {
      const body = await request.text();
      const bodyData = JSON.parse(body);
      targetUrl = bodyData.url || bodyData.targetUrl;
    } catch (error) {
      // 如果解析失败，继续使用查询参数
    }
  }
  
  if (!targetUrl) {
    const errorInfo = {
      error: 'Missing url parameter',
      requestUrl: request.url,
      params: Object.fromEntries(url.searchParams.entries()),
      method: request.method,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorInfo), { 
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  try {
    // 验证目标URL是否为华智云域名
    const target = new URL(targetUrl);
    const allowedHosts = [
      'matomocdn.huazhi.cloud', 
      'cdn.huazhi.cloud',
      'huazhicloud.oss-cn-beijing.aliyuncs.com',
      'api.huazhi.cloud',
      'at.alicdn.com'  // 阿里云CDN字体文件
    ];
    
    if (!allowedHosts.includes(target.hostname)) {
      return new Response(JSON.stringify({
        error: 'Unauthorized proxy target',
        hostname: target.hostname,
        allowedHosts
      }), { 
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 开始代理请求
    
    // 根据请求类型设置合适的Accept头
    const acceptHeader = targetUrl.endsWith('.css') ? 'text/css,*/*;q=0.1' : 
                        targetUrl.includes('.js') ? 'application/javascript,*/*;q=0.1' : 
                        '*/*';
    
    // 构建代理请求的headers
    const proxyHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; Astro-Proxy/1.0)',
      'Accept': acceptHeader,
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://www.huazhi.cloud/',
      'Origin': 'https://www.huazhi.cloud',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
    };
    
    // 复制原始请求的Content-Type（如果存在）
    const requestContentType = request.headers.get('Content-Type');
    if (requestContentType && request.method !== 'GET') {
      proxyHeaders['Content-Type'] = requestContentType;
    }
    
    // 判断是否为静态资源
    const isStaticResource = targetUrl.endsWith('.js') || 
                             targetUrl.endsWith('.css') || 
                             targetUrl.endsWith('.png') || 
                             targetUrl.endsWith('.jpg') || 
                             targetUrl.endsWith('.jpeg') || 
                             targetUrl.endsWith('.gif') || 
                             targetUrl.endsWith('.svg') || 
                             targetUrl.endsWith('.webp') ||
                             targetUrl.endsWith('.woff') ||
                             targetUrl.endsWith('.woff2') ||
                             targetUrl.endsWith('.ttf') ||
                             targetUrl.endsWith('.eot') ||
                             targetUrl.endsWith('.otf') ||
                             targetUrl.includes('.js?') ||
                             targetUrl.includes('livechat.js');
    
    // 构建fetch选项
    const fetchOptions: RequestInit = {
      // 静态资源强制使用GET方法，API请求保持原方法
      method: isStaticResource ? 'GET' : request.method,
      headers: proxyHeaders,
    };
    
    // 对于非静态资源的有body请求，复制请求体
    if (!isStaticResource && request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const body = await request.text();
        if (body) {
          fetchOptions.body = body;
        }
      } catch (error) {
        // 如果读取body失败，继续不带body的请求
      }
    }
    
    // 获取目标资源
    const response = await fetch(targetUrl, fetchOptions);
    
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: `Proxy request failed: ${response.statusText}`,
        status: response.status,
        targetUrl
      }), { 
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    let content = await response.text();
    
    // 如果是CSS文件，需要处理其中的字体文件URL
    if (targetUrl.endsWith('.css')) {
      // 将CSS中的字体文件URL转换为通过代理的URL
      content = content.replace(
        /url\(\/\/([^)]+)\)/g, 
        (match, fontUrl) => {
          // 构建代理URL
          // 获取当前请求的域名和端口
          const currentHost = new URL(request.url).host;
          const proxyUrl = `http://${currentHost}/api/proxy?url=${encodeURIComponent('https://' + fontUrl)}`;
          return `url(${proxyUrl})`;
        }
      );
    }
    
    // 获取响应内容类型
    const responseContentType = response.headers.get('Content-Type') || 'application/octet-stream';
    
    // 根据URL和内容类型确定正确的MIME类型
    let contentType = responseContentType;
    if (targetUrl.endsWith('.css')) {
      contentType = 'text/css';
    } else if (targetUrl.endsWith('.js')) {
      contentType = 'application/javascript';
    } else if (targetUrl.includes('.js?') || targetUrl.includes('livechat.js')) {
      contentType = 'application/javascript';
    } else if (targetUrl.endsWith('.woff')) {
      contentType = 'font/woff';
    } else if (targetUrl.endsWith('.woff2')) {
      contentType = 'font/woff2';
    } else if (targetUrl.endsWith('.ttf')) {
      contentType = 'font/ttf';
    } else if (targetUrl.endsWith('.eot')) {
      contentType = 'application/vnd.ms-fontobject';
    } else if (targetUrl.endsWith('.otf')) {
      contentType = 'font/otf';
    }
    
    // 内容类型处理完成
    
    // 返回内容并设置正确的CORS头
    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
      },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      error: `Proxy error: ${errorMessage}`,
      targetUrl
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

// 导出所有HTTP方法的处理器
export const GET: APIRoute = handleProxyRequest;
export const POST: APIRoute = handleProxyRequest;
export const PUT: APIRoute = handleProxyRequest;
export const PATCH: APIRoute = handleProxyRequest;
export const DELETE: APIRoute = handleProxyRequest;

// 处理OPTIONS预检请求
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  });
}; 