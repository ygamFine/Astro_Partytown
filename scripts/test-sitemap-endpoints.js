#!/usr/bin/env node

/**
 * 测试站点地图端点访问
 */

import { generateFullSitemap, generateLanguageSpecificSitemap } from '../src/lib/sitemapUtils.js';

async function testSitemapEndpoints() {
  console.log('🧪 测试站点地图端点...\n');
  
  try {
    // 设置测试域名
    process.env.CURRENT_HOSTNAME = 'localhost';
    
    console.log('📋 测试主站点地图 (/sitemap.xml)...');
    const sitemapData = await generateFullSitemap();
    
    // 模拟主站点地图响应
    const mainSitemapResponse = new Response(sitemapData.xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
    console.log('✅ 主站点地图响应状态:', mainSitemapResponse.status);
    console.log('✅ 主站点地图Content-Type:', mainSitemapResponse.headers.get('Content-Type'));
    
    // 测试语言特定站点地图
    console.log('\n📋 测试英语站点地图 (/sitemap-en.xml)...');
    const enPages = sitemapData.pages.filter(p => p.lang === 'en');
    const enSitemap = generateLanguageSpecificSitemap(sitemapData.pages, 'en');
    
    const enSitemapResponse = new Response(enSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
    console.log('✅ 英语站点地图响应状态:', enSitemapResponse.status);
    console.log('✅ 英语站点地图Content-Type:', enSitemapResponse.headers.get('Content-Type'));
    console.log('✅ 英语页面数量:', enPages.length);
    
    // 显示英语页面的URL
    console.log('\n📋 英语页面URL:');
    enPages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.url}`);
    });
    
    // 检查XML格式
    console.log('\n📋 检查XML格式...');
    if (enSitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
      console.log('✅ XML格式正确');
    } else {
      console.log('❌ XML格式错误');
      console.log('XML开头:', enSitemap.substring(0, 100));
    }
    
    // 显示完整的XML
    console.log('\n📋 完整的英语站点地图XML:');
    console.log(enSitemap);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testSitemapEndpoints();
