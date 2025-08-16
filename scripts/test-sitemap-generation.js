#!/usr/bin/env node

/**
 * 测试站点地图生成
 */

import { generateFullSitemap, generateLanguageSpecificSitemap } from '../src/lib/sitemapUtils.js';

async function testSitemapGeneration() {
  console.log('🧪 测试站点地图生成...\n');
  
  try {
    // 设置测试域名
    process.env.CURRENT_HOSTNAME = 'localhost';
    
    console.log('📋 生成完整站点地图...');
    const sitemapData = await generateFullSitemap();
    
    console.log(`✅ 成功生成站点地图，包含 ${sitemapData.pages.length} 个页面`);
    
    // 显示前几个页面的URL
    console.log('\n📋 示例页面URL:');
    sitemapData.pages.slice(0, 5).forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.url} (${page.lang})`);
    });
    
    // 检查XML格式
    console.log('\n📋 检查XML格式...');
    const xml = sitemapData.xml;
    
    if (xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
      console.log('✅ XML格式正确');
    } else {
      console.log('❌ XML格式错误');
      console.log('XML开头:', xml.substring(0, 100));
    }
    
    if (xml.includes('<urlset')) {
      console.log('✅ 包含urlset标签');
    } else {
      console.log('❌ 缺少urlset标签');
    }
    
    // 测试语言特定站点地图
    console.log('\n📋 测试语言特定站点地图...');
    const enSitemap = generateLanguageSpecificSitemap(sitemapData.pages, 'en');
    
    if (enSitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) {
      console.log('✅ 英语站点地图XML格式正确');
    } else {
      console.log('❌ 英语站点地图XML格式错误');
    }
    
    // 显示生成的XML片段
    console.log('\n📋 生成的XML片段:');
    console.log(xml.substring(0, 500) + '...');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testSitemapGeneration();
