# Homepage 图片处理更新总结

## 问题分析

您指出需要按照 `download-strapi-images.js` 中产品图片的下载处理方式来处理 homepage 中的图片。

## 🔍 下载脚本的处理方式

### 1. 获取原始数据
```javascript
// 产品（统一接口，原始结构 + 全量分页）
const productsData = await getProducts({ locale, paginate: 'all', mode: 'raw' });
```

### 2. 提取图片URL
```javascript
extractImageUrls(productsData).forEach(url => {
  imageInfoList.push({ url, isBanner: false, type: 'product' });
});
```

### 3. extractImageUrls 函数实现
```javascript
function extractImageUrls(data) {
  const urls = [];

  function extractFromObject(obj) {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      // 处理字符串类型的URL
      if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('/uploads/'))) {
        urls.push(value);
      }
      // 处理数组类型
      else if (Array.isArray(value)) {
        value.forEach(item => {
          if (!item) return;
          if (typeof item === 'string' && (item.startsWith('http') || item.startsWith('/uploads/'))) {
            urls.push(item);
          } else if (typeof item === 'object' && item && item.url) {
            urls.push(item.url);
          } else if (typeof item === 'object' && item) {
            extractFromObject(item);
          }
        });
      }
      // 处理对象类型
      else if (typeof value === 'object' && value) {
        if (value.url) {
          urls.push(value.url);
        } else {
          extractFromObject(value);
        }
      }
    }
  }

  // 处理data字段（Strapi API的标准响应格式）
  if (data && data.data) {
    if (Array.isArray(data.data)) {
      data.data.forEach(item => extractFromObject(item));
    } else {
      extractFromObject(data.data);
    }
  } else {
    extractFromObject(data);
  }

  return [...new Set(urls)]; // 去重
}
```

## ✅ 修改内容

### 1. 添加 extractImageUrls 函数

在 `homepageApi.js` 中添加了与下载脚本相同的 `extractImageUrls` 函数：

```javascript
/**
 * 提取图片URL（参考 download-strapi-images.js 的实现）
 * @param {any} data - 需要提取图片URL的数据
 * @returns {Array<string>} 提取的图片URL数组
 */
function extractImageUrls(data) {
  // 与下载脚本相同的实现
}
```

### 2. 修改 getHomepageContent 函数

按照下载脚本的方式处理首页图片：

```javascript
export async function getHomepageContent() {
  // ... 获取数据 ...
  
  // 1. 提取首页数据中的所有图片URL
  const homepageImageUrls = extractImageUrls(homepageData);
  console.log('从首页数据中提取到的图片URL:', homepageImageUrls);
  
  // 2. 处理每个图片URL，使用 processImageForDisplay
  const processedImageUrls = homepageImageUrls.map(url => {
    const processedUrl = processImageForDisplay(url, imageMapping);
    console.log(`处理图片URL: ${url} -> ${processedUrl}`);
    return processedUrl;
  });
  
  // 3. 递归处理首页数据中的所有图片
  const processedHomepageData = processHomepageImages(homepageData, imageMapping);
  
  // ... 返回处理后的数据 ...
}
```

### 3. 修改 processProductShowcaseImages 函数

按照下载脚本的方式处理产品图片：

```javascript
async function processProductShowcaseImages(products, imageMapping) {
  // ... 验证数据 ...
  
  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    
    // 1. 提取产品数据中的所有图片URL
    const productImageUrls = extractImageUrls(product);
    console.log(`产品 ${index} 提取到的图片URL:`, productImageUrls);
    
    // 2. 处理每个图片URL
    const processedImageUrls = productImageUrls.map(url => {
      const processedUrl = processImageForDisplay(url, imageMapping);
      console.log(`产品 ${index} 处理图片URL: ${url} -> ${processedUrl}`);
      return processedUrl;
    });
    
    // 3. 处理具体的图片字段
    const processedProduct = { ...product };
    
    if (product.image) {
      processedProduct.image = processImageForDisplay(product.image, imageMapping);
    }
    
    if (product.thumbnail) {
      processedProduct.thumbnail = processImageForDisplay(product.thumbnail, imageMapping);
    }
    
    // ... 其他字段处理 ...
    
    processedProducts.push(processedProduct);
  }
  
  return processedProducts;
}
```

## 🎯 处理流程

### 1. 数据获取
- 使用 `fetchJson` 获取首页原始数据
- 数据格式：`{ data: { ... } }`

### 2. 图片URL提取
- 使用 `extractImageUrls` 递归遍历数据
- 提取所有图片URL（字符串、对象、数组）
- 支持 `.media.url` 格式

### 3. 图片处理
- 使用 `processImageForDisplay` 处理每个URL
- 映射到本地缓存的图片路径
- 提供回退机制

### 4. 数据返回
- 返回处理后的完整数据结构
- 保持原有字段结构不变

## 📊 优势

1. **统一处理方式**：与下载脚本使用相同的图片提取逻辑
2. **全面覆盖**：支持各种图片格式和数据结构
3. **调试友好**：详细的日志输出，便于问题排查
4. **向后兼容**：保持原有API接口不变

## 🚀 测试

现在可以运行应用来测试修改后的图片处理：

```bash
npm run dev
```

访问首页，查看控制台输出，确认图片处理是否正常工作。
