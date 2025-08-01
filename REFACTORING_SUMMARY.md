# 代码重构总结：统一重复的变量值

## 问题描述

项目中存在大量重复的 `Buffer.from().toString('base64').replace()` 代码，这些代码用于生成URL和文件名的哈希值。这种重复代码不仅增加了维护成本，还可能导致不一致的行为。

## 重复代码统计

重构前，以下文件中存在重复的哈希生成代码：

### 核心库文件
- `src/lib/strapi.js` - 6处重复
- `src/lib/imageProcessor.js` - 1处重复

### 页面文件
- `src/pages/[lang]/products/[...page].astro` - 2处重复
- `src/pages/[lang]/products/[slug].astro` - 2处重复
- `src/pages/[lang]/news/[slug].astro` - 1处重复
- `src/pages/[lang]/case/[id].astro` - 1处重复

### 脚本文件
- `scripts/download-strapi-images.js` - 1处重复

**总计：14处重复代码**

## 解决方案

### 1. 创建统一的工具函数

创建了 `src/utils/hashUtils.js` 文件，包含以下函数：

```javascript
/**
 * 生成URL哈希值
 * 将任意字符串转换为base64编码并移除特殊字符
 */
export function generateUrlHash(input) {
  if (!input) return '';
  return Buffer.from(input).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * 生成文件名哈希值
 * 专门用于处理文件名的哈希生成
 */
export function generateFilenameHash(filename) {
  if (!filename) return '';
  return generateUrlHash(filename);
}

/**
 * 生成图片URL哈希值
 * 专门用于处理图片URL的哈希生成
 */
export function generateImageHash(imageUrl) {
  if (!imageUrl) return '';
  return generateUrlHash(imageUrl);
}
```

### 2. 更新所有相关文件

#### 核心库文件更新
- **`src/lib/strapi.js`**: 添加导入并替换6处重复代码
- **`src/lib/imageProcessor.js`**: 添加导入并替换1处重复代码

#### 页面文件更新
- **`src/pages/[lang]/products/[...page].astro`**: 添加导入并替换2处重复代码
- **`src/pages/[lang]/products/[slug].astro`**: 添加导入并替换2处重复代码
- **`src/pages/[lang]/news/[slug].astro`**: 添加导入并替换1处重复代码
- **`src/pages/[lang]/case/[id].astro`**: 添加导入并替换1处重复代码

#### 脚本文件更新
- **`scripts/download-strapi-images.js`**: 添加导入并替换1处重复代码

## 重构效果

### 代码质量提升
1. **消除重复**: 将14处重复代码统一为一个工具函数
2. **提高可维护性**: 哈希生成逻辑集中管理，便于修改和优化
3. **增强一致性**: 确保所有地方使用相同的哈希生成算法
4. **改善可读性**: 函数名更清晰地表达了意图

### 性能优化
- 减少了代码体积
- 提高了代码复用性
- 便于后续优化哈希算法

### 维护性提升
- 如果需要修改哈希算法，只需要修改一个地方
- 新增功能时可以直接使用现有工具函数
- 减少了出错的可能性

## 使用示例

### 重构前
```javascript
const urlHash = Buffer.from(img).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
```

### 重构后
```javascript
import { generateImageHash } from '../../../utils/hashUtils.js';

const urlHash = generateImageHash(img);
```

## 注意事项

1. **向后兼容**: 新的工具函数保持了与原有代码相同的功能
2. **类型安全**: 函数包含了空值检查，提高了代码的健壮性
3. **文档完整**: 每个函数都有详细的JSDoc注释

## 后续建议

1. **测试验证**: 建议运行完整的测试套件，确保重构没有引入问题
2. **性能监控**: 监控哈希生成性能，确保没有性能退化
3. **代码审查**: 建议团队成员审查重构后的代码
4. **文档更新**: 更新相关的开发文档，说明新的工具函数使用方法 