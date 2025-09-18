// 生成多语言子域名的 sitemap 与 sitemap 索引
// 规则：
// - 以 dist 根目录下的语言目录为准（如 en, zh-Hans, ja ...）
// - 将每个语言目录内的所有 HTML 转为对应子域名下的 URL
// - 子域名映射：
//   en->en、zh-Hans->zh、zh-Hant->zh-hant、pt-pt->pt、其他默认 `${lang}`
// - 需要环境变量 PUBLIC_SITE_URL（用于解析协议与主域名，例：https://www.example.com）
import dotenv from 'dotenv';
dotenv.config();

import { promises as fs } from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');

function getProtocolAndApex() {
  const site = process.env.PUBLIC_SITE_URL;
  console.log('获取到的 site 地址', site);
  if (!site) {
    throw new Error('PUBLIC_SITE_URL 环境变量未设置');
  }
  let url;
  try {
    url = new URL(site);
  } catch {
    url = new URL('');
  }
  const protocol = url.protocol.replace(':', '') || 'https';
  const hostname = url.hostname || 'example.com';
  const apex = hostname.replace(/^www\./i, '');
  return { protocol, apex };
}

async function loadLocaleSubdomainMap() {
  // 从 vercel.json 的 rewrites 中自动解析：
  // { "source": "/sitemap.xml", "destination": "/<locale>/sitemap.xml", "has": [{ "type": "host", "value": "<sub>.*" }] }
  // 解析得到映射：locale -> sub
  const vercelJsonPath = path.resolve(process.cwd(), 'vercel.json');
  try {
    const raw = await fs.readFile(vercelJsonPath, 'utf8');
    const config = JSON.parse(raw);
    const map = new Map();
    const rw = Array.isArray(config?.rewrites) ? config.rewrites : [];
    const destLocaleRe = /^\/([^/]+)\/sitemap\.xml$/;
    for (const r of rw) {
      if (r?.source !== '/sitemap.xml') continue;
      const dest = r?.destination || '';
      const m = destLocaleRe.exec(dest);
      if (!m) continue;
      const locale = m[1];
      const hostConds = Array.isArray(r?.has) ? r.has : [];
      const host = hostConds.find((h) => h?.type === 'host' && typeof h?.value === 'string')?.value || '';
      const sub = host.replace(/\.\*$/, '') // 去掉 .*
                      .replace(/^\^/, '') // 兼容可能的正则起始符
                      .replace(/\$$/, ''); // 兼容可能的正则结束符
      if (sub) map.set(locale, sub);
    }
    return map;
  } catch {
    return new Map();
  }
}

function shouldSkipDir(name) {
  return (
    name.startsWith('_') ||
    [
      'pages',
      'chunks',
      'images',
      'pagefind',
      'fontIcons',
      'scripts',
      '_astro'
    ].includes(name)
  );
}

function normalizeToPrettyPath(relativeHtmlPath) {
  // 将 a/b/index.html -> /a/b/
  // 将 a/b.html -> /a/b.html（保留）
  let p = '/' + relativeHtmlPath.replace(/\\/g, '/');
  if (p.endsWith('/index.html')) {
    p = p.slice(0, -('/index.html'.length)) + '/';
  }
  return p;
}

async function collectHtmlFiles(dir, baseDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(baseDir, full);
    if (entry.isDirectory()) {
      // 跳过一些非页面目录
      if (shouldSkipDir(entry.name)) continue;
      results.push(...(await collectHtmlFiles(full, baseDir)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(rel);
    }
  }
  return results;
}

function buildSitemapXml(urls) {
  const now = new Date().toISOString();
  const items = urls
    .map((u) => `  <url><loc>${u}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`) 
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

function buildSitemapIndexXml(entries) {
  const now = new Date().toISOString();
  const items = entries
    .map((u) => `  <sitemap><loc>${u}</loc><lastmod>${now}</lastmod></sitemap>`) 
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

async function main() {
  // 确保 dist 存在
  try {
    await fs.access(DIST_DIR);
  } catch {
    console.error('dist 目录不存在，请先运行构建。');
    process.exit(1);
  }

  const { protocol, apex } = getProtocolAndApex();
  const distEntries = await fs.readdir(DIST_DIR, { withFileTypes: true });
  const locales = distEntries
    .filter((e) => e.isDirectory() && !shouldSkipDir(e.name))
    .map((e) => e.name);

  const localeSubMap = await loadLocaleSubdomainMap();
  const indexEntries = [];

  for (const locale of locales) {
    const localeDir = path.join(DIST_DIR, locale);
    // 收集该语言目录下的 HTML 页面
    const htmlFiles = await collectHtmlFiles(localeDir, localeDir);
    if (htmlFiles.length === 0) continue;

    const sub = localeSubMap.get(locale) || locale;
    const host = `${sub}.${apex}`;
    const urls = htmlFiles.map((rel) => `${protocol}://${host}${normalizeToPrettyPath(rel)}`);

    // 写入该语言专属的 sitemap.xml
    const xml = buildSitemapXml(urls);
    await fs.writeFile(path.join(localeDir, 'sitemap.xml'), xml, 'utf8');

    // 写入该语言专属 robots.txt（可选，便于按主机访问）
    const robots = `User-agent: *\nAllow: /\nSitemap: ${protocol}://${host}/sitemap.xml\n`;
    await fs.writeFile(path.join(localeDir, 'robots.txt'), robots, 'utf8');

    indexEntries.push(`${protocol}://${host}/sitemap.xml`);
  }

  // 生成 sitemap 索引，方便根域名查看整体
  if (indexEntries.length > 0) {
    const indexXml = buildSitemapIndexXml(indexEntries);
    await fs.writeFile(path.join(DIST_DIR, 'sitemap-index.xml'), indexXml, 'utf8');
  }

  console.log(`✅ 已为 ${indexEntries.length} 种语言生成 sitemap.xml，并生成 sitemap-index.xml`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


