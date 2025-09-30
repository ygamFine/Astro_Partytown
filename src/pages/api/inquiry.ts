// Astro API 路由：处理询盘表单提交，与现有 Astro 表单逻辑保持一致
import type { APIRoute } from 'astro';
import { ITALKIN_API } from '../../apis/apiClient';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { visitorId, ...payload } = body;
    console.log('获取到的 visitorId', visitorId);
    console.log('获取到的 body', body);
    if (!visitorId) {
      return new Response(
        JSON.stringify({ error: 'visitorId 不能为空', success: false }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 使用与现有表单相同的提交逻辑
    const res = await fetch(`${ITALKIN_API}/biz/inquiry/${encodeURIComponent(visitorId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const result = await res.json();

    return new Response(JSON.stringify({ data: result, success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Inquiry API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: '提交询盘时发生错误', 
        success: false 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
