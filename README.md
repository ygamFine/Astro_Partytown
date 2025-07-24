# Astro + Partytown 项目

## 项目概述

这是一个基于 Astro 框架的多语言企业网站项目，集成了 Partytown 用于第三方脚本优化。

## 主要功能

- 🌐 **多语言支持**: 支持 21 种语言
- 📸 **SSG 图片系统**: 构建时图片本地化，完全静态化
- 🔍 **全文检索**: 支持产品、新闻、案例的全站搜索
- 📱 **响应式设计**: 移动端优化
- ⚡ **性能优化**: WebP 图片格式，懒加载，CDN 支持

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 构建流程

```bash
npm run build
```

构建过程包括：

1. **下载 Strapi 图片** → 从 API 下载所有图片到本地
2. **优化图片** → 转换为 WebP 格式，生成响应式图片
3. **Astro 构建** → 生成静态页面
4. **生成搜索索引** → 创建全文检索索引文件

## 项目结构

```
├── src/
│   ├── components/          # Astro 组件
│   ├── layouts/            # 页面布局
│   ├── pages/              # 页面文件
│   ├── lib/                # 工具库
│   │   ├── searchIndex.js  # 搜索功能
│   │   ├── clientSearch.js # 客户端搜索
│   │   └── strapi.js       # Strapi API 集成
│   └── locales/            # 多语言文件
├── public/                 # 静态资源
│   ├── images/             # 图片文件
│   └── search-index.json   # 搜索索引
├── scripts/                # 构建脚本
│   ├── download-strapi-images.js  # 图片下载
│   ├── optimize-images.sh         # 图片优化
│   └── generate-search-index.js   # 搜索索引生成
└── dist/                   # 构建输出
```

## 环境配置

项目使用环境变量进行配置，支持多环境部署：

- `.env` - 默认配置
- `.env.development` - 开发环境
- `.env.production` - 生产环境
- `.env.staging` - 测试环境

详细配置说明请参考 `ENV_MIGRATION_GUIDE.md`。

## 部署

项目支持部署到任何静态托管服务：

- **Vercel**: 自动检测 Astro 项目
- **Netlify**: 支持静态站点部署
- **GitHub Pages**: 免费静态托管
- **阿里云 OSS**: 对象存储服务

## 技术栈

- **框架**: Astro 5.x
- **样式**: Tailwind CSS
- **图片优化**: Sharp, WebP
- **第三方脚本**: Partytown
- **多语言**: i18n
- **搜索**: 客户端全文检索

## 性能优化

- 🖼️ **图片优化**: WebP 格式，响应式图片
- 📦 **代码分割**: 按页面分割 JavaScript
- 🚀 **懒加载**: 图片和组件懒加载
- 🌐 **CDN**: 静态资源 CDN 分发
- 🔍 **搜索优化**: 预生成搜索索引

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
