# LanguageSelector 语言选择器组件

## 📖 组件说明

`LanguageSelector` 是一个独立的国际化语言选择器组件，用于在网站中提供多语言切换功能。

## 🚀 功能特性

- **多语言支持**: 支持任意数量的语言选项
- **智能显示**: 当只有一种语言时自动隐藏
- **响应式设计**: 适配不同屏幕尺寸
- **动画效果**: 平滑的下拉菜单动画
- **键盘友好**: 支持键盘导航
- **可配置**: 支持自定义显示逻辑

## 📋 Props 接口

```typescript
interface Props {
  supportedLanguages: Array<{
    localeCode: string;    // 语言代码，如 'zh-Hans', 'en'
    name: string;          // 语言名称，如 '简体中文', 'English'
    locale?: string;       // 可选的语言本地化名称
  }>;
  currentLang: string;     // 当前选中的语言代码
  showLanguageSelector?: boolean;        // 是否显示语言选择器，默认 true
  hideWhenSingleLanguage?: boolean;      // 单语言时是否隐藏，默认 false
}
```

## 💻 使用方法

### 基本用法

```astro
---
import { LanguageSelector } from '../LanguageSelector/index.ts';

const supportedLanguages = [
  { localeCode: 'zh-Hans', name: '简体中文' },
  { localeCode: 'en', name: 'English' },
  { localeCode: 'ja', name: '日本語' }
];

const currentLang = 'zh-Hans';
---

<LanguageSelector 
  supportedLanguages={supportedLanguages}
  currentLang={currentLang}
/>
```

### 高级用法

```astro
---
import { LanguageSelector } from '../LanguageSelector/index.ts';

const supportedLanguages = [
  { 
    localeCode: 'zh-Hans', 
    name: '简体中文', 
    locale: '简体中文',
    domain: 'zh-hans.example.com'
  },
  { 
    localeCode: 'zh-Hant', 
    name: '繁體中文', 
    locale: '繁體中文',
    domain: 'zh-hant.example.com'
  },
  { 
    localeCode: 'en', 
    name: 'English', 
    locale: 'English',
    domain: 'en.example.com'
  }
];

const currentLang = 'zh-Hans';
const showLanguageSelector = true;
const hideWhenSingleLanguage = true;
---

<LanguageSelector 
  supportedLanguages={supportedLanguages}
  currentLang={currentLang}
  showLanguageSelector={showLanguageSelector}
  hideWhenSingleLanguage={hideWhenSingleLanguage}
/>
```

### 环境判断示例

组件会自动根据当前环境构建不同的链接：

**本地开发环境**：
- 链接：`/zh-Hans/`, `/en/`
- 行为：在当前页面打开
- 适用：本地开发和测试

**生产环境**：
- 链接：`https://zh-hans.example.com/`, `https://en.example.com/`
- 行为：在新标签页打开
- 适用：生产环境多站点

## 🎨 样式定制

组件使用 Tailwind CSS 类名，可以通过以下方式定制样式：

### 1. 覆盖默认样式

```css
/* 自定义语言选择器样式 */
.language-selector {
  background-color: #your-color;
  border-color: #your-border-color;
}

/* 自定义下拉菜单样式 */
.language-dropdown {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
```

### 2. 使用 CSS 变量

```css
:root {
  --language-selector-bg: #ffffff;
  --language-selector-border: #e5e7eb;
  --language-option-hover: #f3f4f6;
}
```

## 🔧 事件处理

组件内置了完整的交互逻辑：

- **点击切换**: 点击选择器框切换下拉菜单
- **语言选择**: 点击语言选项切换语言
- **外部关闭**: 点击外部区域自动关闭下拉菜单
- **键盘支持**: 支持 Tab 键导航

## 🌐 语言切换逻辑

### 开发环境（localhost 或 127.0.0.1）
- 使用路径前缀方式：`/zh-Hans/`, `/en/`
- 在当前页面打开（`target="_self"`）
- 适合本地开发和测试

### 生产环境
- 使用子域名方式：`zh-hans.example.com`, `en.example.com`
- 在新标签页中打开（`target="_blank"`）
- 适合生产环境的多站点架构

## 📱 响应式支持

- **桌面端**: 完整功能，包括悬停效果
- **移动端**: 触摸友好的交互设计
- **平板端**: 自适应布局

## 🚨 注意事项

1. **字体图标**: 确保项目中已引入 `iconfont` 字体图标库
2. **语言数据**: 确保 `supportedLanguages` 数据格式正确
3. **样式冲突**: 注意避免与现有样式的冲突
4. **性能考虑**: 大量语言选项时考虑分页或搜索功能

## 🔍 故障排除

### 常见问题

1. **组件不显示**
   - 检查 `showLanguageSelector` 属性
   - 确认 `supportedLanguages` 数组不为空

2. **样式异常**
   - 检查 Tailwind CSS 是否正确加载
   - 确认字体图标库是否引入

3. **交互无响应**
   - 检查 JavaScript 是否正确执行
   - 确认 DOM 元素 ID 是否唯一

## 📚 相关文件

- `LanguageSelector.astro` - 主组件文件
- `index.ts` - 导出文件
- `README.md` - 使用说明文档

## 🤝 贡献指南

如需修改或扩展组件功能，请：

1. 保持组件的独立性
2. 遵循现有的代码风格
3. 更新相关文档
4. 测试不同场景下的表现

---

**版本**: 1.0.0  
**维护者**: 开发团队  
**最后更新**: 2024年
