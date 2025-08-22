// 统一的基础域名解析工具（构建期/运行期均可用）

export function resolveBaseDomain() {
  try {
    if (typeof process !== 'undefined' && process.env) {
      // 明确设置优先
      if (process.env.BASE_DOMAIN) return process.env.BASE_DOMAIN;
      if (process.env.PUBLIC_BASE_DOMAIN) return process.env.PUBLIC_BASE_DOMAIN;

      // 从完整站点 URL 提取
      if (process.env.PUBLIC_SITE_URL) {
        const host = new URL(process.env.PUBLIC_SITE_URL).hostname;
        return host.split('.').slice(-2).join('.');
      }

      // 当前请求主机名（如通过中间层传入）
      if (process.env.CURRENT_HOSTNAME) {
        const host = process.env.CURRENT_HOSTNAME;
        return host.split('.').slice(-2).join('.');
      }

      // Vercel 默认提供的 URL
      if (process.env.VERCEL_URL) {
        const host = process.env.VERCEL_URL;
        return host.split('.').slice(-2).join('.');
      }
    }
  } catch {}

  return 'localhost';
}


