// Astro 多语言 API 路由：与 /api/inquiry 一致，匹配 /en/api/inquiry 等本地化前缀
import type { APIRoute } from 'astro';
import { ITALKIN_API } from '../../../apis/apiClient';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { visitorId, ...payload } = body;
    if (!visitorId) {
      return new Response(
        JSON.stringify({ error: 'visitorId 不能为空', success: false }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const res = await fetch(`${ITALKIN_API}/biz/inquiry/${encodeURIComponent(visitorId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const result = await res.json();

    return new Response(
      JSON.stringify({ data: result, success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: '提交询盘时发生错误', success: false }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};


