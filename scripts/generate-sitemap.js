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
const OUTPUT_DIR = path.resolve(process.cwd(), '.vercel/output/static');
const ROBOTS_TEMPLATE_PATH = path.resolve(process.cwd(), 'src/config/robots.txt');

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
  const hostname = url.hostname || '';
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
      // 解析正则：^en\..+$ -> en
      const sub = host.replace(/^\^/, '') // 去掉正则起始符 ^· 
                      .replace(/\\\./g, '.') // 转义的点 \. -> .
                      .replace(/\.\.\+\$$/, '') // 去掉 ..+$
                      .replace(/\.\*\$$/, '') // 去掉 .*$
                      .replace(/\$$/, ''); // 去掉结束符 $
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
      '_astro',
      'fonts',
      'public',
      'plugins'
    ].includes(name)
  );
}

function normalizeToPrettyPath(relativeHtmlPath) {
  // 将 a/b/index.html -> /a/b/
  // 将 a/b.html -> /a/b.html（保留）
  let p = '/' + relativeHtmlPath.replace(/\\/g, '/');
  if (p.endsWith('/index.html')) {
    p = p.slice(0, -('/index.html'.length));
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
  console.log('🚀 开始生成多语言 sitemap...');
  
  // 确保 dist 存在
  try {
    await fs.access(DIST_DIR);
    console.log('✅ dist 目录存在');
  } catch (error) {
    console.error('❌ dist 目录不存在，请先运行构建。');
    console.error('错误详情:', error.message);
    process.exit(1);
  }

  // 加载 robots.txt 模板
  let robotsTemplate;
  try {
    robotsTemplate = await fs.readFile(ROBOTS_TEMPLATE_PATH, 'utf8');
    console.log('✅ 加载 robots.txt 模板成功');
  } catch (error) {
    console.error('❌ 无法加载 robots.txt 模板:', error.message);
    process.exit(1);
  }

  // 确保 Vercel 输出目录存在
  const useVercelOutput = await fs.access(OUTPUT_DIR).then(() => true).catch(() => false);
  const targetDir = useVercelOutput ? OUTPUT_DIR : DIST_DIR;
  console.log(`📁 目标输出目录: ${useVercelOutput ? 'Vercel 输出目录' : 'dist 目录'} (${targetDir})`);
  
  if (useVercelOutput) {
    console.log('✅ 检测到 Vercel 构建环境，直接在输出目录生成 sitemap');
  }

  const { protocol, apex } = getProtocolAndApex();
  console.log(`📍 使用站点配置: ${protocol}://${apex}`);
  
  let distEntries;
  try {
    distEntries = await fs.readdir(DIST_DIR, { withFileTypes: true });
  } catch (error) {
    console.error('❌ 无法读取 dist 目录:', error.message);
    process.exit(1);
  }
  
  const locales = distEntries
    .filter((e) => e.isDirectory() && !shouldSkipDir(e.name))
    .map((e) => e.name);
  
  console.log(`🌍 发现语言目录: ${locales.join(', ')}`);

  const localeSubMap = await loadLocaleSubdomainMap();
  const indexEntries = [];

  for (const locale of locales) {
    console.log(`🔄 处理语言: ${locale}`);
    const localeDir = path.join(DIST_DIR, locale);
    
    try {
      // 收集该语言目录下的 HTML 页面
      const htmlFiles = await collectHtmlFiles(localeDir, localeDir);
      console.log(`  📄 找到 ${htmlFiles.length} 个 HTML 文件`);
      
      if (htmlFiles.length === 0) {
        console.log(`  ⚠️  跳过 ${locale}（无 HTML 文件）`);
        continue;
      }

      const sub = localeSubMap.get(locale) || locale;
      const host = `${sub}.${apex}`;
      const urls = htmlFiles.map((rel) => `${protocol}://${host}${normalizeToPrettyPath(rel)}`);
      console.log(`  🌐 子域名: ${host}`);

      // 写入该语言专属的 sitemap.xml
      const xml = buildSitemapXml(urls);
      const targetLocaleDir = path.join(targetDir, locale);
      
      // 确保目标语言目录存在
      await fs.mkdir(targetLocaleDir, { recursive: true });
      
      const sitemapPath = path.join(targetLocaleDir, 'sitemap.xml');
      await fs.writeFile(sitemapPath, xml, 'utf8');
      console.log(`  ✅ 生成: ${sitemapPath}`);

      // 写入该语言专属 robots.txt（使用模板）
      const robots = robotsTemplate.replace('{{SITEMAP_URL}}', `${protocol}://${host}/sitemap.xml`);
      const robotsPath = path.join(targetLocaleDir, 'robots.txt');
      await fs.writeFile(robotsPath, robots, 'utf8');
      console.log(`  ✅ 生成: ${robotsPath}`);

      indexEntries.push(`${protocol}://${host}/sitemap.xml`);
    } catch (error) {
      console.error(`❌ 处理 ${locale} 时出错:`, error.message);
      // 继续处理其他语言，不要因为一个语言失败就全部失败
    }
  }

  // 生成 sitemap 索引，方便根域名查看整体
  if (indexEntries.length > 0) {
    const indexXml = buildSitemapIndexXml(indexEntries);
    await fs.writeFile(path.join(targetDir, 'sitemap-index.xml'), indexXml, 'utf8');
    console.log(`  ✅ 生成索引: ${path.join(targetDir, 'sitemap-index.xml')}`);
  }

  console.log(`✅ 已为 ${indexEntries.length} 种语言生成 sitemap.xml，并生成 sitemap-index.xml`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


