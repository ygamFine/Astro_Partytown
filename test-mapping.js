import { generateImageHash } from './src/utils/hashUtils.js';

// 测试图片映射逻辑
const testUrl = 'http://47.251.126.80/api/uploads/979769965_f35df3da26.jpg';
const relativePath = '/uploads/979769965_f35df3da26.jpg';
const fileName = '979769965_f35df3da26.jpg';

console.log('测试URL:', testUrl);
console.log('相对路径:', relativePath);
console.log('文件名:', fileName);

// 计算各种哈希值
const urlHash = generateImageHash(testUrl);
const relativePathBase64 = Buffer.from(relativePath).toString('base64');

console.log('URL哈希:', urlHash);
console.log('相对路径base64:', relativePathBase64);

// 模拟图片映射数据
const imageMapping = {
  strapiImages: [
    '/images/strapi/L3VwbG9hZHMvOTc5NzY5OTY1X2YzNWRmM2RhMjYuanBn.webp',
    '/images/strapi/L3VwbG9hZHMvMTVfanBnXzNhYWMyNWI5Yjkud2VicA.webp'
  ]
};

// 测试匹配逻辑
function testMapping(img) {
  const urlHash = generateImageHash(img);
  const fileName = img.split('/').pop();
  
  console.log(`\n测试图片: ${img}`);
  console.log('文件名:', fileName);
  console.log('URL哈希:', urlHash);
  
  // 尝试多种匹配方式
  const cachedImage = imageMapping.strapiImages.find((cached) => {
    // 1. 直接匹配文件名
    if (cached.includes(fileName)) {
      console.log('✅ 文件名匹配:', cached);
      return true;
    }
    
    // 2. 匹配hash
    if (cached.includes(urlHash)) {
      console.log('✅ 哈希匹配:', cached);
      return true;
    }
    
    // 3. 匹配原始URL的base64编码
    try {
      const encodedUrl = Buffer.from(img).toString('base64');
      if (cached.includes(encodedUrl)) {
        console.log('✅ URL编码匹配:', cached);
        return true;
      }
      // 处理Base64填充字符
      const encodedUrlNoPadding = encodedUrl.replace(/=+$/, '');
      if (cached.includes(encodedUrlNoPadding)) {
        console.log('✅ URL编码匹配(无填充):', cached);
        return true;
      }
    } catch (e) {}
    
    // 4. 匹配相对路径的base64编码（这是关键！）
    try {
      const relativePath = img.replace(/^https?:\/\/[^\/]+/, '');
      const encodedRelativePath = Buffer.from(relativePath).toString('base64');
      if (cached.includes(encodedRelativePath)) {
        console.log('✅ 相对路径编码匹配:', cached);
        return true;
      }
    } catch (e) {}
    
    return false;
  });
  
  if (cachedImage) {
    console.log('🎯 找到匹配:', cachedImage);
    return cachedImage;
  } else {
    console.log('❌ 未找到匹配，使用原始URL');
    return img;
  }
}

// 测试不同的URL格式
console.log('\n=== 测试完整URL ===');
testMapping(testUrl);

console.log('\n=== 测试相对路径 ===');
testMapping(relativePath); 