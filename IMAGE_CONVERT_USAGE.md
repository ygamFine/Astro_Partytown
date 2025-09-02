# ImageConvert 使用指南

## 概述

`imageConvert.js` 提供了完整的图片下载、转换和本地化处理功能，特别适用于处理 Strapi 的 `/uploads/` 格式图片路径。

## 处理 "/uploads/logo_png_f8afa2762b.webp" 格式

### 1. 基本用法

```javascript
import { processLogoImage, processUploadImage } from '../utils/imageConvert.js';

// 处理 logo 图片
const logoPath = "/uploads/logo_png_f8afa2762b.webp";
const strapiStaticUrl = "https://your-strapi-domain.com";
const imageCacheDir = "src/assets/strapi";

const processedLogo = await processLogoImage(logoPath, strapiStaticUrl, imageCacheDir);
console.log('处理后的路径:', processedLogo);
// 输出: /assets/logo_png_f8afa2762b.webp
```

### 2. 在 Header 组件中的使用

```astro
---
import { processLogoImage } from '../../../utils/imageConvert.js';

// 处理logo图片本地化
let logoImage = '/images/logo.png.webp'; // 默认图片

if (siteConfiguration?.field_logo?.media?.url) {
  const logoPath = siteConfiguration.field_logo.media.url;
  
  // 如果是 uploads 格式的路径，使用 processLogoImage 处理
  if (logoPath.startsWith('/uploads/')) {
    try {
      const strapiStaticUrl = import.meta.env.STRAPI_STATIC_URL;
      const imageCacheDir = 'src/assets/strapi';
      
      const processedLogo = await processLogoImage(logoPath, strapiStaticUrl, imageCacheDir);
      if (processedLogo && processedLogo !== logoPath) {
        logoImage = processedLogo;
        console.log('✅ Logo 本地化处理成功:', logoImage);
      }
    } catch (error) {
      console.error('❌ Logo 处理出错:', error);
      logoImage = logoPath; // 出错时使用原始路径
    }
  } else {
    logoImage = logoPath;
  }
}
---

<Image src={logoImage} alt="Logo" />
```

## 核心函数说明

### `processLogoImage(logoPath, strapiStaticUrl, imageCacheDir)`

专门处理 logo 图片的函数：

- **输入**: 
  - `logoPath`: 图片路径（如 "/uploads/logo_png_f8afa2762b.webp"）
  - `strapiStaticUrl`: Strapi 服务器地址
  - `imageCacheDir`: 本地缓存目录

- **输出**: 本地化的图片路径（如 "/assets/logo_png_f8afa2762b.webp"）

- **处理流程**:
  1. 检查路径格式
  2. 转换为完整 URL
  3. 下载图片到本地
  4. 转换为 WebP 格式（如果需要）
  5. 返回本地路径

### `processUploadImage(imagePath, strapiStaticUrl, imageCacheDir, bannerImageDir)`

通用图片处理函数：

- **输入**: 
  - `imagePath`: 图片路径
  - `strapiStaticUrl`: Strapi 服务器地址
  - `imageCacheDir`: 图片缓存目录
  - `bannerImageDir`: Banner 图片目录

- **输出**: 处理后的文件名或 null

## 处理流程详解

### 1. 路径识别
```javascript
// 识别 uploads 格式
if (logoPath.startsWith('/uploads/')) {
  // 转换为完整 URL
  const fullUrl = `${strapiStaticUrl}${logoPath}`;
  // 例如: "https://your-strapi.com/uploads/logo_png_f8afa2762b.webp"
}
```

### 2. 下载处理
```javascript
// 使用 downloadImage 函数下载
const result = await downloadImage(fullUrl, false, strapiStaticUrl, imageCacheDir, null);
// 下载到: src/assets/strapi/logo_png_f8afa2762b.webp
```

### 3. 返回路径
```javascript
// 返回可访问的路径
return `/assets/${result}`;
// 例如: "/assets/logo_png_f8afa2762b.webp"
```

## 错误处理

### 1. 网络错误
```javascript
try {
  const processedLogo = await processLogoImage(logoPath, strapiStaticUrl, imageCacheDir);
  // 处理成功
} catch (error) {
  console.error('❌ Logo 处理出错:', error);
  // 使用原始路径作为后备
  logoImage = logoPath;
}
```

### 2. 路径验证
```javascript
if (!logoPath) {
  console.log('❌ Logo 路径为空');
  return null;
}
```

## 环境配置

### 1. 环境变量
```bash
# .env 文件
STRAPI_STATIC_URL=https://your-strapi-domain.com
IMAGE_CACHE_DIR=src/assets/strapi
```

### 2. 目录结构
```
src/
├── assets/
│   └── strapi/           # 图片缓存目录
│       ├── logo_png_f8afa2762b.webp
│       └── banner/       # Banner 图片目录
└── utils/
    └── imageConvert.js   # 图片处理工具
```

## 性能优化

### 1. 缓存机制
- 图片下载后缓存在本地
- 避免重复下载相同图片
- 支持增量更新

### 2. 格式转换
- 自动转换为 WebP 格式
- 保持 Banner 图片原始质量
- 支持多种图片格式

## 注意事项

1. **权限检查**: 确保有写入缓存目录的权限
2. **网络连接**: 需要能够访问 Strapi 服务器
3. **存储空间**: 注意本地缓存目录的磁盘空间
4. **错误处理**: 始终提供错误处理和后备方案
5. **路径格式**: 确保传入的路径格式正确

## 完整示例

```javascript
// 完整的 logo 处理示例
async function handleLogoImage(siteConfiguration) {
  const logoPath = siteConfiguration?.field_logo?.media?.url;
  
  if (!logoPath) {
    return '/images/logo.png.webp'; // 默认图片
  }
  
  if (logoPath.startsWith('/uploads/')) {
    try {
      const processedLogo = await processLogoImage(
        logoPath,
        process.env.STRAPI_STATIC_URL,
        'src/assets/strapi'
      );
      
      return processedLogo || logoPath;
    } catch (error) {
      console.error('Logo 处理失败:', error);
      return logoPath; // 返回原始路径
    }
  }
  
  return logoPath;
}
```
