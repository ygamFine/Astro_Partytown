// 调试产品数据格式
const STRAPI_BASE_URL = 'http://47.251.126.80/api';
const STRAPI_TOKEN = 'your-token-here'; // 需要实际的token

async function debugProducts() {
  try {
    const response = await fetch(`${STRAPI_BASE_URL}/products?locale=en&populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('原始数据:', JSON.stringify(data.data[0], null, 2));
    
    const item = data.data[0];
    console.log('\n图片字段 (item.imgs):', item.imgs);
    console.log('图片字段类型:', typeof item.imgs);
    console.log('是否为数组:', Array.isArray(item.imgs));
    
    if (Array.isArray(item.imgs)) {
      item.imgs.forEach((img, index) => {
        console.log(`图片 ${index}:`, img);
        console.log(`图片 ${index} 类型:`, typeof img);
        if (typeof img === 'object') {
          console.log(`图片 ${index} 对象:`, img);
        }
      });
    }
  } catch (error) {
    console.error('调试失败:', error.message);
  }
}

debugProducts(); 