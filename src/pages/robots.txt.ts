import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /
Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const baseURL = site ||process.env.PUBLIC_SITE_URL;
  const sitemapURL = new URL('sitemap.xml', baseURL);
  return new Response(getRobotsTxt(sitemapURL));
};