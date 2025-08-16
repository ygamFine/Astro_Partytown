#!/usr/bin/env node

/**
 * 站点地图问题诊断脚本
 */

import { generateFullSitemap, generateLanguageSpecificSitemap } from '../src/lib/sitemapUtils.js';

async function diagnoseSitemapIssue() {
  console.log('🔍 站点地图问题诊断\n');
  
  try {
    // 设置测试域名
    process.env.CURRENT_HOSTNAME = 'localhost';
    
    console.log('📋 1. 检查站点地图生成...');
    const sitemapData = await generateFullSitemap();
    console.log(`✅ 站点地图生成成功，包含 ${sitemapData.pages.length} 个页面`);
    
    console.log('\n📋 2. 检查XML格式...');
    const xml = sitemapData.xml;
    if (xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
      console.log('✅ XML格式正确');
    } else {
      console.log('❌ XML格式错误');
      console.log('实际开头:', xml.substring(0, 100));
    }
    
    console.log('\n📋 3. 检查URL格式...');
    const sampleUrls = sitemapData.pages.slice(0, 3);
    sampleUrls.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.url}`);
      if (page.url.includes('localhost')) {
        console.log(`      ✅ 使用localhost域名`);
      } else {
        console.log(`      ❌ 域名不正确: ${page.url}`);
      }
    });
    
    console.log('\n📋 4. 检查语言特定站点地图...');
    const enSitemap = generateLanguageSpecificSitemap(sitemapData.pages, 'en');
    const enPages = sitemapData.pages.filter(p => p.lang === 'en');
    console.log(`✅ 英语站点地图包含 ${enPages.length} 个页面`);
    
    console.log('\n📋 5. 问题分析和解决方案...');
    console.log('');
    console.log('🔍 可能的问题:');
    console.log('   1. 访问了错误的URL');
    console.log('   2. 服务器没有运行');
    console.log('   3. 端口号不正确');
    console.log('   4. 访问了错误的端点');
    console.log('');
    console.log('💡 解决方案:');
    console.log('   1. 确保开发服务器正在运行: npm run dev');
    console.log('   2. 访问正确的URL: http://localhost:3000/sitemap-en.xml');
    console.log('   3. 检查浏览器开发者工具中的网络请求');
    console.log('   4. 确保Content-Type是 application/xml');
    console.log('');
    console.log('📋 正确的访问URL:');
    console.log('   - 主站点地图: http://localhost:3000/sitemap.xml');
    console.log('   - 英语站点地图: http://localhost:3000/sitemap-en.xml');
    console.log('   - 中文站点地图: http://localhost:3000/sitemap-zh-CN.xml');
    console.log('   - 站点地图索引: http://localhost:3000/sitemap-index.xml');
    console.log('');
    console.log('🔍 测试命令:');
    console.log('   curl -v http://localhost:3000/sitemap-en.xml');
    console.log('   curl -H "Accept: application/xml" http://localhost:3000/sitemap-en.xml');
    
    console.log('\n📋 6. 生成的XML示例...');
    console.log('英语站点地图XML (前500字符):');
    console.log(enSitemap.substring(0, 500) + '...');
    
  } catch (error) {
    console.error('❌ 诊断失败:', error);
  }
}

// 运行诊断
diagnoseSitemapIssue();
