# 动态路由功能说明

## 概述

本项目实现了一个特殊的动态路由功能，可以根据接口数据自动生成自定义路径的页面。

## 功能特点

- ✅ 支持多语言路由
- ✅ 基于接口数据动态生成路径
- ✅ 支持SEO设置
- ✅ 支持关键词标签
- ✅ 简洁的实现方式

## 文件结构

```
src/
├── pages/[lang]/[...slug].astro    # 动态路由页面
└── lib/
    └── dynamicPages.js             # 动态页面数据工具
```

## 使用方法

### 1. 接口数据格式

接口需要返回以下格式的数据：

```json
{
  "data": [
    {
      "id": 2,
      "title": "页面标题",
      "details": "<p>页面内容</p>",
      "url_slug": {
        "url_slug": "/custom-path"
      },
      "seoSetting": {
        "title": "SEO标题",
        "describe": "SEO描述"
      },
      "keyword": [
        {
          "keyword": "关键词1"
        },
        {
          "keyword": "关键词2"
        }
      ]
    }
  ]
}
```

### 2. 配置接口

在 `src/lib/dynamicPages.js` 中修改 `getDynamicPagesData` 函数：

```javascript
// 使用真实接口
export async function getDynamicPagesData(apiUrl = 'https://your-api.com/pages') {
  // 函数会自动处理接口调用
}
```

### 3. 访问页面

生成的页面可以通过以下URL访问：
- `/en/test` - 英文版本
- `/zh-CN/test` - 中文版本
- `/ja/test` - 日文版本
- 等等...

## 当前配置

目前使用模拟数据，路径为 `/test`，包含：
- 页面标题：测试1
- 富文本内容：HTML格式的图片内容
- 关键词：111
- 支持所有语言版本

## 扩展功能

### 添加更多页面数据

在 `src/lib/dynamicPages.js` 的 `mockApiData` 中添加更多数据：

```javascript
const mockApiData = {
  "data": [
    {
      "id": 2,
      "title": "测试1",
      "url_slug": { "url_slug": "/test" }
    },
    {
      "id": 3,
      "title": "测试2", 
      "url_slug": { "url_slug": "/test2" }
    }
  ]
};
```

### 自定义页面模板

在 `src/pages/[lang]/[...slug].astro` 中修改页面模板，添加更多字段显示。

## 注意事项

1. `url_slug` 字段必须以 `/` 开头
2. 路径会自动移除开头的 `/` 作为路由参数
3. 支持所有项目配置的语言
4. 页面会自动生成静态文件，支持SEO优化

## 测试

访问 `http://localhost:4321/en/test` 查看动态生成的页面。
