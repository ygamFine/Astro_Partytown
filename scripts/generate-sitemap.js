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
    // 从站点地图数据中提取语言（来源于后端语言列表接口）
    const languages = Array.from(new Set((sitemapData.pages || []).map(p => p.lang).filter(Boolean)));
    if (!languages.length) {
      console.warn('未从后端获取到语言列表，默认回退到 en');
      languages.push('en');
    }
    
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
    const lastmod = new Date().toISOString();
    const toSub = (lang) => lang === 'zh-CN' ? 'zh' : (lang === 'zh-Hant' ? 'zh-hant' : (lang === 'pt-pt' ? 'pt' : lang));
    const sitemapIndexEntries = languages.map((lang) => {
      const sub = toSub(lang);
      return `  <sitemap>\n    <loc>https://${sub}.aihuazhi.cn/sitemap.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`;
    }).join('\n');
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapIndexEntries}\n</sitemapindex>`;
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
