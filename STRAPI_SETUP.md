# Strapi 5 集成配置说明

## ✅ 当前状态

项目已成功集成Strapi 5 CMS，**完全依赖** `http://47.251.126.80/api/menus` 接口获取菜单数据。

**🎉 配置完成 - 100% API驱动！**

⚠️ **重要**: 已删除所有默认菜单数据，网站完全依赖Strapi API。如果API不可用，菜单将为空。

## 📊 实际菜单数据结构

当前从Strapi获取的菜单数据格式：

```json
{
  "data": [
    {
      "id": 2,
      "documentId": "j179g3l3s7jqywozmrtu93b5",
      "name": "首页",
      "path": "/",
      "createdAt": "2025-06-24T10:13:16.038Z",
      "updatedAt": "2025-06-24T10:13:16.038Z",
      "publishedAt": "2025-06-24T10:13:16.047Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 5
    }
  }
}
```

## 🔧 当前实现功能

### ✅ 成功功能
- ✅ **API认证**: 使用Bearer Token成功连接
- ✅ **数据获取**: 成功获取5个菜单项
- ✅ **智能重试**: 主API失败时使用备用endpoints (`/api/menus?populate=*`)
- ✅ **数据格式化**: 正确处理Strapi 5的数据结构
- ✅ **SSG兼容**: 构建时预渲染所有页面
- ✅ **100% API驱动**: 完全移除默认数据，强制依赖Strapi

### 🚀 API调用策略
1. **主要API**: `/api/menus` (优先使用)
2. **备用API**: `/api/menus?populate=*` (主API失败时)
3. **其他备用**: `/api/menu-items`, `/api/navigations`
4. **失败处理**: 抛出错误，不提供任何默认数据

### 🔐 认证配置
当前使用的Token (256字符):
```
2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21
```

## 📈 构建性能

- **总页面**: 17个静态页面
- **API调用**: 每页面成功获取菜单数据
- **构建时间**: ~4秒 (优化后)
- **错误处理**: 严格模式 - API失败则构建失败

## ⚠️ 重要注意事项

### 🔴 API依赖性
- **无后备方案**: 删除了所有默认菜单数据
- **严格模式**: API不可用时菜单为空
- **构建依赖**: Strapi必须在线才能成功构建

### 🛡️ 风险缓解
1. **多重API**: 4个不同的endpoint作为备用
2. **详细日志**: 清晰的错误信息便于调试
3. **快速失败**: 立即发现API问题

## 📝 下一步集成计划

现在菜单系统已完成，可以继续集成其他内容：

1. **产品数据**: 
   - API endpoint: `/api/products`
   - 替换 `src/data/products.js`

2. **新闻数据**: 
   - API endpoint: `/api/articles` 或 `/api/news`
   - 替换 `src/data/news.js`

3. **公司信息**: 
   - API endpoint: `/api/company-info`
   - 动态公司简介、统计数据

4. **媒体管理**: 
   - 集成Strapi媒体库
   - 动态图片URL管理

## 🔧 环境变量配置

如需修改配置，可创建 `.env` 文件：

```bash
# Strapi配置
STRAPI_URL=http://47.251.126.80
STRAPI_TOKEN=your_custom_token_here
```

## 🚀 生产环境建议

1. **HTTPS**: 生产环境使用 `https://` 协议
2. **CDN**: 配置CDN缓存静态资源
3. **Token安全**: 使用环境变量管理敏感Token
4. **监控**: 设置API可用性监控
5. **备份策略**: 考虑API数据的备份方案 