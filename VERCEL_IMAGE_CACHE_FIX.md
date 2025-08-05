# Vercel 部署图片缓存修复方案

## 问题描述

在Vercel部署环境中，Strapi图片没有正确下载到项目的静态文件目录中，导致网站无法显示CMS中的图片。

## 根本原因

1. **路径配置错误**：Vercel环境中的图片缓存目录路径配置不正确
2. **环境检测缺失**：脚本没有正确检测Vercel部署环境
3. **构建流程问题**：Astro构建时public目录内容直接复制到dist根目录，而不是dist/public

## 修复方案

### 1. 环境检测和路径配置

**文件**: `scripts/download-strapi-images.js`

```javascript
// 根据部署环境确定图片缓存目录
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const isProduction = process.env.NODE_ENV === 'production';

let IMAGE_CACHE_DIR;
if (isVercel) {
  // Vercel部署环境：使用 /vercel/path0/dist/images/strapi
  IMAGE_CACHE_DIR = process.env.IMAGE_CACHE_DIR || '/vercel/path0/dist/images/strapi';
} else {
  // 本地开发环境：使用相对路径
  IMAGE_CACHE_DIR = process.env.IMAGE_CACHE_DIR || 'public/images/strapi';
}
```

### 2. Vercel专用构建脚本

**文件**: `scripts/vercel-build.js`

创建了专门的Vercel构建脚本，包含：
- 环境变量设置
- 图片下载
- 图片优化（本地环境）
- Astro构建
- 搜索索引生成
- 构建结果验证

### 3. Vercel配置更新

**文件**: `vercel.json`

```json
{
    "version": 2,
    "buildCommand": "npm run build:vercel",
    "outputDirectory": "dist",
    "env": {
        "IMAGE_CACHE_DIR": "/vercel/path0/dist/images/strapi",
        "NODE_ENV": "production"
    }
}
```

### 4. 包脚本更新

**文件**: `package.json`

```json
{
  "scripts": {
    "build": "npm run download:strapi-images && npm run optimize:images && astro build && npm run generate:search-index",
    "build:vercel": "node scripts/vercel-build.js"
  }
}
```

## 修复效果

### ✅ 本地开发环境
- 图片下载到 `public/images/strapi/`
- 图片优化正常执行
- 构建输出到 `dist/images/strapi/`

### ✅ Vercel部署环境
- 图片下载到 `/vercel/path0/dist/images/strapi/`
- 跳过图片优化（避免系统依赖问题）
- 构建验证通过

### 📊 验证结果

```
✅ dist 目录存在: /path/to/dist
✅ images/strapi 目录存在: /path/to/dist/images/strapi
📊 Strapi 图片数量: 16
📋 图片文件列表:
   - L3VwbG9hZHMvMTFfMF9hOTNjNDI2OWVkLmpwZWc.jpeg
   - L3VwbG9hZHMvMTFfMF9hOTNjNDI2OWVkLmpwZWc.webp
   - L3VwbG9hZHMvMTVfanBnXzNhYWMyNWI5Yjkud2VicA.webp
   ...
```

## 部署流程

1. **本地开发**: `npm run build`
2. **Vercel部署**: `npm run build:vercel` (自动执行)
3. **图片下载**: 从Strapi CMS下载所有图片
4. **图片优化**: 转换为WebP格式（本地环境）
5. **静态构建**: Astro生成静态文件
6. **结果验证**: 确认图片文件存在

## 注意事项

1. **Vercel环境限制**: 图片优化脚本在Vercel中跳过，因为需要系统依赖
2. **路径一致性**: 确保本地和Vercel环境的图片路径一致
3. **缓存机制**: 脚本会跳过已存在的图片，避免重复下载
4. **映射文件**: 自动生成URL到本地路径的映射关系

## 相关文件

- `scripts/download-strapi-images.js` - 图片下载脚本
- `scripts/vercel-build.js` - Vercel专用构建脚本
- `vercel.json` - Vercel部署配置
- `package.json` - 包脚本配置
- `src/data/strapi-image-mapping.json` - 图片映射文件 