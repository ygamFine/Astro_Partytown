# WebP 图片优化功能

## 概述

本项目已实现自动WebP图片优化功能，在下载Strapi图片时自动转换为WebP格式，提升网站性能和加载速度。

## 功能特性

### ✅ 自动WebP转换
- 下载Strapi图片时自动转换为WebP格式
- 使用 `cwebp` 工具进行高质量转换
- 转换质量设置为80%，平衡文件大小和图片质量

### ✅ Vercel构建兼容
- 完全兼容Vercel构建环境
- 在任何环境下都会执行图片优化
- 支持CI/CD流程

### ✅ 智能回退机制
- 如果WebP转换失败，自动保存原始格式
- 如果没有安装WebP工具，保存原始格式
- 确保构建过程不会因图片问题而失败

### ✅ 临时文件管理
- 自动创建和清理临时目录
- 避免磁盘空间浪费
- 保持构建环境清洁

## 构建流程

```bash
npm run build
```

构建流程包括：
1. **下载Strapi图片** (`npm run download:strapi-images`)
   - 从Strapi API下载所有图片
   - 自动转换为WebP格式
   - 生成图片映射文件

2. **优化本地图片** (`npm run optimize:images`)
   - 转换本地JPG/PNG为WebP
   - 生成移动端响应式图片
   - 生成图片统计报告

3. **构建Astro项目** (`astro build`)
   - 使用优化后的WebP图片
   - 生成静态文件

4. **生成搜索索引** (`npm run generate:search-index`)
   - 创建搜索功能索引

## 图片映射文件

生成的 `src/data/strapi-image-mapping.json` 包含：

```json
{
  "strapiImages": ["/images/strapi/hash1.webp", "/images/strapi/hash2.webp"],
  "webpImages": ["/images/strapi/hash1.webp", "/images/strapi/hash2.webp"],
  "totalCount": 10,
  "webpCount": 10,
  "generatedAt": "2025-08-05T10:47:50.897Z"
}
```

## 性能提升

- **文件大小减少**: WebP格式通常比JPG/PNG小30-50%
- **加载速度提升**: 更小的文件大小意味着更快的页面加载
- **带宽节省**: 减少用户流量消耗
- **SEO优化**: 更快的加载速度有助于搜索引擎排名

## 技术实现

### 依赖工具
- `cwebp`: WebP转换工具
- `ImageMagick`: 图片处理工具（用于响应式图片）

### 安装依赖
```bash
# macOS
brew install webp imagemagick

# Ubuntu
sudo apt-get install webp imagemagick
```

### 文件结构
```
public/images/strapi/
├── hash1.webp          # Strapi图片1（WebP格式）
├── hash2.webp          # Strapi图片2（WebP格式）
└── ...

src/data/
└── strapi-image-mapping.json  # 图片映射文件
```

## 注意事项

1. **WebP兼容性**: 现代浏览器都支持WebP格式
2. **回退支持**: 如果转换失败，会保存原始格式
3. **缓存机制**: 已转换的图片不会重复转换
4. **临时文件**: 构建完成后自动清理临时文件

## 故障排除

### WebP转换失败
- 检查是否安装了 `cwebp` 工具
- 确保有足够的磁盘空间
- 检查图片文件是否损坏

### 构建失败
- 检查网络连接（下载Strapi图片需要）
- 确保Strapi API配置正确
- 检查环境变量设置

## 更新日志

- **2025-08-05**: 实现自动WebP转换功能
- 支持Vercel构建环境
- 添加智能回退机制
- 优化临时文件管理 