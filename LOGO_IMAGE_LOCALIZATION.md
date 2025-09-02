# Logo 图片本地化处理实现

## 概述

本文档说明如何在 Header 组件中按照本站现有的方法进行 logo 图片本地化处理。

## 实现步骤

### 1. 导入必要的图片处理工具

```astro
---
import { loadImageMappingWithCreate, processImageWithMapping } from '../../../lib/imageUtils.js';
---
```

### 2. 加载图片映射数据

```astro
---
// 获取图片映射数据
let imageMapping = { strapiImages: [] };
try {
  imageMapping = await loadImageMappingWithCreate();
} catch (error) {
  console.error('加载图片映射失败:', error);
}
---
```

### 3. 处理 logo 图片本地化

```astro
---
// 处理logo图片本地化
const logoImage = processImageWithMapping(
  siteConfiguration?.field_logo, 
  imageMapping
) || '/images/logo.png.webp';
---
```

## 关键函数说明

### `loadImageMappingWithCreate()`
- 加载图片映射文件
- 如果文件不存在会自动创建默认映射文件
- 返回包含 `strapiImages` 数组的映射对象

### `processImageWithMapping(img, imageMapping)`
- 统一的图片处理函数
- 支持字符串URL、图片对象、数组等多种输入格式
- 自动将 Strapi 图片 URL 映射到本地缓存路径
- 如果映射失败，返回原始 URL

## 数据流程

```
1. 从 siteConfiguration 获取 field_logo 数据
2. 加载本地图片映射文件
3. 使用 processImageWithMapping 处理图片
4. 如果处理成功，返回本地缓存路径
5. 如果处理失败，返回默认图片路径
```

## 错误处理

- 图片映射加载失败时，使用空对象作为默认值
- 图片处理失败时，使用硬编码的默认图片路径
- 所有错误都会在控制台输出，便于调试

## 优势

1. **性能优化**：使用本地缓存的图片，避免重复下载
2. **可靠性**：提供默认图片作为后备方案
3. **一致性**：使用本站统一的图片处理逻辑
4. **可维护性**：集中管理图片映射逻辑

## 注意事项

1. 确保 `src/data/strapi-image-mapping.json` 文件存在且可读
2. 默认图片路径 `/images/logo.png.webp` 必须存在
3. 图片映射文件会在首次访问时自动创建
4. 开发环境中可能需要手动更新图片映射
