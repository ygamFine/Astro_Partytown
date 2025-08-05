import { generateImageHash } from './src/utils/hashUtils.js';

const testUrl = 'http://47.251.126.80/api/uploads/979769965_f35df3da26.jpg';
const fileName = testUrl.split('/').pop();
const urlHash = generateImageHash(testUrl);

console.log('测试URL:', testUrl);
console.log('文件名:', fileName);
console.log('URL哈希:', urlHash);
console.log('文件名base64:', Buffer.from(fileName).toString('base64'));
console.log('完整URL base64:', Buffer.from(testUrl).toString('base64'));

// 检查本地缓存文件
import fs from 'fs';
import path from 'path';

const cacheDir = './public/images/strapi';
const files = fs.readdirSync(cacheDir);

console.log('\n本地缓存文件:');
files.forEach(file => {
  if (file.includes(fileName) || file.includes(urlHash)) {
    console.log('✅ 匹配文件:', file);
  }
}); 