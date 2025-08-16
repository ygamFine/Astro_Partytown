#!/usr/bin/env node

/**
 * 验证站点地图URL访问方式
 */

console.log('🗺️ 站点地图URL验证指南\n');

console.log('📋 正确的站点地图访问URL:');
console.log('');

console.log('1. 主站点地图 (包含所有语言):');
console.log('   http://localhost:3000/sitemap.xml');
console.log('   https://en.localhost:3000/sitemap.xml');
console.log('   https://zh.localhost:3000/sitemap.xml');
console.log('');

console.log('2. 语言特定站点地图:');
console.log('   http://localhost:3000/sitemap-en.xml');
console.log('   http://localhost:3000/sitemap-zh-CN.xml');
console.log('   http://localhost:3000/sitemap-ar.xml');
console.log('   http://localhost:3000/sitemap-de.xml');
console.log('   http://localhost:3000/sitemap-ja.xml');
console.log('   http://localhost:3000/sitemap-ru.xml');
console.log('');

console.log('3. 站点地图索引:');
console.log('   http://localhost:3000/sitemap-index.xml');
console.log('');

console.log('⚠️  注意事项:');
console.log('   - 确保访问的是 .xml 端点，不是 .txt 或其他格式');
console.log('   - 确保服务器正在运行 (npm run dev)');
console.log('   - 检查浏览器开发者工具中的网络请求');
console.log('   - 确保Content-Type是 application/xml');
console.log('');

console.log('🔍 测试命令:');
console.log('   curl -H "Accept: application/xml" http://localhost:3000/sitemap-en.xml');
console.log('   curl -H "Accept: application/xml" http://localhost:3000/sitemap.xml');
console.log('');

console.log('📱 在浏览器中访问:');
console.log('   http://localhost:3000/sitemap-en.xml');
console.log('   http://localhost:3000/sitemap.xml');
