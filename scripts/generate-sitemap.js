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
    // 设置生产环境
    process.env.NODE_ENV = 'production';
    
    // 确保dist目录存在
    const distDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    console.log('📋 生成主站点地图...');
    const sitemapData = await generateFullSitemap();
    
    // 写入主站点地图
    const mainSitemapPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(mainSitemapPath, sitemapData.xml);
    console.log(`✅ 主站点地图已生成: ${mainSitemapPath}`);
    
    // 生成语言特定站点地图
    const languages = ['en', 'zh-CN', 'ar', 'de', 'ja', 'ru'];
    
    for (const lang of languages) {
      console.log(`📋 生成 ${lang} 语言站点地图...`);
      
      const langSitemap = generateLanguageSpecificSitemap(sitemapData.pages, lang);
      
      // 根据语言确定子域名
      const subdomain = lang === 'zh-CN' ? 'zh' : lang;
      const langSitemapPath = path.join(distDir, `${subdomain}`, 'sitemap.xml');
      
      // 确保子目录存在
      const subdomainDir = path.dirname(langSitemapPath);
      if (!fs.existsSync(subdomainDir)) {
        fs.mkdirSync(subdomainDir, { recursive: true });
      }
      
      fs.writeFileSync(langSitemapPath, langSitemap);
      console.log(`✅ ${lang} 站点地图已生成: ${langSitemapPath}`);
    }
    
    // 生成站点地图索引
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
    
    // 验证生成的URL
    console.log('\n📋 验证生成的URL:');
    const sampleUrls = sitemapData.pages.slice(0, 3);
    sampleUrls.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.url}`);
      if (page.url.includes('aihuazhi.cn') && !page.url.includes('localhost')) {
        console.log(`      ✅ 正确使用 aihuazhi.cn 域名`);
      } else {
        console.log(`      ❌ 域名错误`);
      }
    });
    
    console.log('\n🎉 站点地图生成完成！');
    console.log('📁 生成的文件:');
    console.log('   - dist/sitemap.xml (主站点地图)');
    console.log('   - dist/en/sitemap.xml (英语站点地图)');
    console.log('   - dist/zh/sitemap.xml (中文站点地图)');
    console.log('   - dist/ar/sitemap.xml (阿拉伯语站点地图)');
    console.log('   - dist/de/sitemap.xml (德语站点地图)');
    console.log('   - dist/ja/sitemap.xml (日语站点地图)');
    console.log('   - dist/ru/sitemap.xml (俄语站点地图)');
    console.log('   - dist/sitemap-index.xml (站点地图索引)');
    
  } catch (error) {
    console.error('❌ 生成站点地图失败:', error);
    process.exit(1);
  }
}

// 运行生成
generateSitemap();
