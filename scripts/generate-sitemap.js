#!/usr/bin/env node

/**
 * 构建时生成站点地图
 * 根据多语种生成静态的站点地图文件
 */

import { generateFullSitemap, generateLanguageSpecificSitemap } from '../src/lib/sitemapUtils.js';
import fs from 'fs';
import path from 'path';

async function generateSitemap() {
  console.log('🗺️ 构建时生成站点地图...\n');
  try {
    process.env.NODE_ENV = 'production';
    const distDir = path.join(process.cwd(), 'dist');
    const vercelOutputDir = path.join(process.cwd(), '.vercel', 'output', 'static');
    
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    const sitemapData = await generateFullSitemap();
    const languages = ['en', 'zh-CN', 'ar', 'de', 'ja', 'ru'];
    
    for (const lang of languages) {
      console.log(`📋 生成 ${lang} 语言站点地图...`);
      const langSitemap = generateLanguageSpecificSitemap(sitemapData.pages, lang);
      const subdomain = lang === 'zh-CN' ? 'zh' : lang; // Determine subdomain
      const langSitemapPath = path.join(distDir, `${subdomain}`, 'sitemap.xml'); // New path structure
      const subdomainDir = path.dirname(langSitemapPath);
      if (!fs.existsSync(subdomainDir)) {
        fs.mkdirSync(subdomainDir, { recursive: true });
      }
      fs.writeFileSync(langSitemapPath, langSitemap);
      console.log(`✅ ${lang} 站点地图已生成: ${langSitemapPath}`);
    }

    // Generate sitemap index
    console.log('📋 生成站点地图索引...');
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
    <loc>https://ar.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://de.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://ja.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://ru.aihuazhi.cn/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
    const sitemapIndexPath = path.join(distDir, 'sitemap-index.xml');
    fs.writeFileSync(sitemapIndexPath, sitemapIndex);
    console.log(`✅ 站点地图索引已生成: ${sitemapIndexPath}`);

    // 复制站点地图文件到Vercel输出目录
    console.log('📋 复制站点地图文件到Vercel输出目录...');
    if (fs.existsSync(vercelOutputDir)) {
      // 复制站点地图索引
      const vercelSitemapIndexPath = path.join(vercelOutputDir, 'sitemap-index.xml');
      fs.copyFileSync(sitemapIndexPath, vercelSitemapIndexPath);
      console.log(`✅ 站点地图索引已复制到: ${vercelSitemapIndexPath}`);

      // 复制语言特定的站点地图
      for (const lang of languages) {
        const subdomain = lang === 'zh-CN' ? 'zh' : lang;
        const sourcePath = path.join(distDir, `${subdomain}`, 'sitemap.xml');
        const targetDir = path.join(vercelOutputDir, `${subdomain}`);
        const targetPath = path.join(targetDir, 'sitemap.xml');
        
        if (fs.existsSync(sourcePath)) {
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ ${lang} 站点地图已复制到: ${targetPath}`);
        }
      }
    } else {
      console.log('⚠️  Vercel输出目录不存在，跳过复制');
    }

    console.log('\n📋 验证生成的URL:');
    const sampleUrls = sitemapData.pages.slice(0, 3);
    sampleUrls.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.url}`);
      if (page.url.includes('aihuazhi.cn')) {
        console.log(`      ✅ 正确使用 aihuazhi.cn 域名`);
      } else {
        console.log(`      ❌ 域名不正确`);
      }
    });

    console.log('\n🎉 站点地图生成完成！');
    console.log('📁 生成的文件:');
    console.log('   - dist/en/sitemap.xml (英语站点地图)');
    console.log('   - dist/zh/sitemap.xml (中文站点地图)');
    console.log('   - dist/ar/sitemap.xml (阿拉伯语站点地图)');
    console.log('   - dist/de/sitemap.xml (德语站点地图)');
    console.log('   - dist/ja/sitemap.xml (日语站点地图)');
    console.log('   - dist/ru/sitemap.xml (俄语站点地图)');
    console.log('   - dist/sitemap-index.xml (站点地图索引)');
    console.log('📁 复制到Vercel输出目录的文件:');
    console.log('   - .vercel/output/static/sitemap-index.xml');
    console.log('   - .vercel/output/static/en/sitemap.xml');
    console.log('   - .vercel/output/static/zh/sitemap.xml');
    console.log('   - .vercel/output/static/ar/sitemap.xml');
    console.log('   - .vercel/output/static/de/sitemap.xml');
    console.log('   - .vercel/output/static/ja/sitemap.xml');
    console.log('   - .vercel/output/static/ru/sitemap.xml');
  } catch (error) {
    console.error('❌ 生成站点地图失败:', error);
    process.exit(1);
  }
}

generateSitemap();
