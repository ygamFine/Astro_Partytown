# Astro + Partytown 多语言企业网站

一个基于 Astro 框架构建的多语言企业网站，支持 22 种语言，采用 SSG（静态站点生成）架构。

## 🌟 特性

- **多语言支持**: 支持 22 种语言，包括中文、英文、阿拉伯语等
- **SSG 架构**: 完全静态生成，极快的加载速度
- **RTL 支持**: 阿拉伯语从右到左布局支持
- **响应式设计**: 完美适配桌面端、平板端、移动端
- **SEO 优化**: 完整的 SEO 元数据和结构化数据
- **性能优化**: 图片懒加载、代码分割、缓存优化

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # 组件目录
│   ├── templates/      # 模板组件
│   └── ...            # 其他组件
├── data/              # 静态数据
├── layouts/           # 布局组件
├── lib/               # 工具函数
├── locales/           # 国际化文件
├── pages/             # 页面文件
│   └── [lang]/        # 多语言路由
├── styles/            # 样式文件
└── types/             # TypeScript 类型定义
```

## 🌍 多语言支持

### 支持的语言

- 中文简体 (zh-hans)
- 中文繁体 (zh-hant)
- 英语 (en)
- 阿拉伯语 (ar) - RTL 支持
- 日语 (ja)
- 韩语 (ko)
- 法语 (fr)
- 德语 (de)
- 西班牙语 (es)
- 意大利语 (it)
- 葡萄牙语 (pt-pt)
- 荷兰语 (nl)
- 波兰语 (pl)
- 俄语 (ru)
- 土耳其语 (tr)
- 泰语 (th)
- 越南语 (vi)
- 印尼语 (id)
- 马来语 (ms)
- 缅甸语 (my)
- 印地语 (hi)
- 马拉雅拉姆语 (ml)

### 路由结构

```
/[lang]/              # 首页
/[lang]/products      # 产品列表
/[lang]/products/[slug] # 产品详情
/[lang]/case          # 案例列表
/[lang]/case/[id]     # 案例详情
/[lang]/news          # 新闻列表
/[lang]/news/[slug]   # 新闻详情
```

## 🎨 技术栈

- **框架**: Astro 5.x
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **构建**: Vite
- **部署**: 支持任何静态托管服务

## 📦 部署

项目支持部署到任何静态托管服务：

- Vercel
- Netlify
- GitHub Pages
- AWS S3
- 阿里云 OSS
- 腾讯云 COS

## 🔧 开发指南

### 添加新语言

1. 在 `src/locales/` 下创建语言目录
2. 添加翻译文件：`breadcrumb.json`, `product.json`, `pagination.json`
3. 在 `src/locales/i18n.js` 中添加语言配置

### 添加新页面

1. 在 `src/pages/[lang]/` 下创建页面文件
2. 实现 `getStaticPaths()` 函数
3. 添加对应的翻译文件

### 组件开发

- 使用 TypeScript 进行类型检查
- 遵循 Astro 组件规范
- 支持服务端渲染和客户端交互

## 📊 性能优化

- **图片优化**: WebP 格式，懒加载
- **代码分割**: 按路由自动分割
- **缓存策略**: 静态资源长期缓存
- **压缩**: CSS/JS 自动压缩
- **预加载**: 关键资源预加载

## 🔍 SEO 优化

- 完整的 meta 标签
- 结构化数据 (JSON-LD)
- 面包屑导航
- 多语言 hreflang
- 站点地图生成

## 📱 响应式设计

- 移动优先设计
- 断点：sm(640px), md(768px), lg(1024px), xl(1280px)
- 触摸友好的交互
- 优化的移动端性能

## 🛠️ 故障排除

### 常见问题

1. **构建失败**: 检查 TypeScript 类型错误
2. **翻译不显示**: 确认翻译文件路径正确
3. **样式问题**: 检查 Tailwind CSS 配置
4. **性能问题**: 使用 Lighthouse 进行性能分析

### 调试技巧

- 使用浏览器开发者工具
- 检查 Astro 构建日志
- 验证翻译文件格式
- 测试不同语言路由

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 这是一个生产就绪的多语言企业网站模板，已优化为符合 SSG 标准。
