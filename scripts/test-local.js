#!/usr/bin/env node

/**
 * 本地API测试脚本
 * 测试Strapi API连接和数据格式
 */

const STRAPI_BASE_URL = 'http://47.251.126.80/api';
const STRAPI_TOKEN = '2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21';

const endpoints = ['menus', 'news', 'products', 'company'];

async function testAPI() {
  console.log('🔍 测试Strapi API连接...\n');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 测试 ${endpoint}...`);
      
      const response = await fetch(`${STRAPI_BASE_URL}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: ${response.status} OK`);
        console.log(`   数据条数: ${data.data?.length || 0}`);
        
        if (data.data?.[0]) {
          const firstItem = data.data[0];
          console.log(`   示例数据: ${JSON.stringify(firstItem, null, 2).substring(0, 100)}...`);
        }
      } else {
        console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎯 测试完成！');
  console.log('💡 如果所有API都正常，可以运行: npm run preview:local');
}

testAPI(); 