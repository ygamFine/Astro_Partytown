#!/usr/bin/env node

/**
 * 测试动态域名站点地图生成
 */

import { generateFullSitemap } from '../src/lib/sitemapUtils.js';

// 测试不同的域名
const testDomains = [
  'aihuazhi.cn',
  'example.com', 
  'mydomain.org',
  'test-site.net'
];

async function testDynamicSitemap() {
  console.log('🧪 测试动态域名站点地图生成...\n');
  
  for (const domain of testDomains) {
    console.log(`🌐 测试域名: ${domain}`);
    
    // 设置环境变量模拟不同域名
    process.env.CURRENT_HOSTNAME = domain;
    
    try {
      const sitemapData = await generateFullSitemap();
      
      // 检查生成的URL是否使用了正确的域名
      const sampleUrls = sitemapData.pages.slice(0, 3);
      
      console.log(`✅ 成功生成站点地图，包含 ${sitemapData.pages.length} 个页面`);
      console.log('📋 示例URL:');
      sampleUrls.forEach((page, index) => {
        console.log(`   ${index + 1}. ${page.url}`);
      });
      
      // 验证域名是否正确
      const allUrlsUseCorrectDomain = sitemapData.pages.every(page => 
        page.url.includes(domain)
      );
      
      if (allUrlsUseCorrectDomain) {
        console.log(`✅ 所有URL都使用了正确的域名: ${domain}`);
      } else {
        console.log(`❌ 部分URL使用了错误的域名`);
      }
      
    } catch (error) {
      console.error(`❌ 生成站点地图失败:`, error.message);
    }
    
    console.log(''); // 空行分隔
  }
  
  console.log('🎉 动态域名站点地图测试完成！');
}

// 运行测试
testDynamicSitemap();
