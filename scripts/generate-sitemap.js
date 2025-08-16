#!/usr/bin/env node

/**
 * 构建时生成站点地图
 * 根据多语种生成静态的站点地图文件
 */

import { generateFullSitemap, generateLanguageSpecificSitemap } from '../src/lib/sitemapUtils.js';
import fs from 'fs';
import path from 'path';

async function generateSitemap() {
  try {
    process.env.NODE_ENV = 'production';
    const distDir = path.join(process.cwd(), 'dist');
    const vercelOutputDir = path.join(process.cwd(), '.vercel', 'output', 'static');
    
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    const sitemapData = await generateFullSitemap();
    const languages = [
      'en', 'zh-CN', 'zh-Hant', 'fr', 'de', 'it', 'tr', 'es', 'pt-pt', 
      'nl', 'pl', 'ar', 'ru', 'th', 'id', 'vi', 'ms', 'ml', 'my', 'hi', 'ja', 'ko'
    ];
    
    for (const lang of languages) {
      const langSitemap = generateLanguageSpecificSitemap(sitemapData.pages, lang);
      
      // 根据语言确定子域名
      let subdomain;
      if (lang === 'zh-CN') {
        subdomain = 'zh';
      } else if (lang === 'zh-Hant') {
        subdomain = 'zh-hant';
      } else if (lang === 'pt-pt') {
        subdomain = 'pt';
      } else {
        subdomain = lang;
      }
      
      const langSitemapPath = path.join(distDir, `${subdomain}`, 'sitemap.xml');
      const subdomainDir = path.dirname(langSitemapPath);
      if (!fs.existsSync(subdomainDir)) {
        fs.mkdirSync(subdomainDir, { recursive: true });
      }
      fs.writeFileSync(langSitemapPath, langSitemap);
    }

    // Generate sitemap index
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://en.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://zh.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://zh-hant.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://fr.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://de.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://it.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://tr.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://es.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pt.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://nl.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pl.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://ar.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://ru.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://th.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://id.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://vi.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://ms.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://ml.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://my.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://hi.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://ja.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://ko.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
    const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml');
    fs.writeFileSync(sitemapIndexPath, sitemapIndex);

    // 复制站点地图文件到Vercel输出目录
    if (fs.existsSync(vercelOutputDir)) {
      // 复制站点地图索引
      const vercelSitemapIndexPath = path.join(vercelOutputDir, 'sitemap-index.xml');
      fs.copyFileSync(sitemapIndexPath, vercelSitemapIndexPath);

      // 复制语言特定的站点地图
      for (const lang of languages) {
        let subdomain;
        if (lang === 'zh-CN') {
          subdomain = 'zh';
        } else if (lang === 'zh-Hant') {
          subdomain = 'zh-hant';
        } else if (lang === 'pt-pt') {
          subdomain = 'pt';
        } else {
          subdomain = lang;
        }
        
        const sourcePath = path.join(distDir, `${subdomain}`, 'sitemap.xml');
        const targetDir = path.join(vercelOutputDir, `${subdomain}`);
        const targetPath = path.join(targetDir, 'sitemap.xml');
        
        if (fs.existsSync(sourcePath)) {
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
    }

    console.log('✅ 站点地图生成完成');
  } catch (error) {
    console.error('❌ 生成站点地图失败:', error);
    process.exit(1);
  }
}

generateSitemap();
