# 🚀 Vercel 部署配置指南

## ✅ 当前配置状态

您的项目已配置为Vercel部署模式：

- **部署URL**: https://astro-partytown.vercel.app
- **模式**: 服务器端渲染 (SSR)
- **适配器**: @astrojs/vercel/serverless
- **API端点**: 支持动态API路由

---

## 🔧 API端点配置

### 1. Strapi代理端点
**URL**: `/api/strapi-proxy?endpoint=menus`
```javascript
// 用法示例
const response = await fetch('/api/strapi-proxy?endpoint=menus');
const menus = await response.json();
```

### 2. Webhook处理端点
**URL**: `/api/webhook`
```javascript
// Strapi webhook配置
{
  "name": "Vercel部署触发",
  "url": "https://astro-partytown.vercel.app/api/webhook",
  "events": ["entry.create", "entry.update", "entry.delete", "entry.publish", "entry.unpublish"]
}
```

---

## 🔄 数据更新流程

### 方式1: API代理 (实时)
1. **客户端检查**: 通过 `/api/strapi-proxy` 获取最新数据
2. **实时更新**: 5秒后检查，每10分钟检查一次
3. **用户体验**: 发现更新时提示刷新

### 方式2: Webhook触发 (自动)
1. **Strapi更新**: 内容发布时触发webhook
2. **Vercel接收**: `/api/webhook` 处理通知
3. **自动重建**: 触发新的部署 (如果配置)

---

## 📋 Strapi Webhook配置

### 在Strapi管理后台配置:

1. **访问**: http://47.251.126.80/admin
2. **进入**: Settings → Webhooks
3. **创建新Webhook**:
   - **Name**: `Vercel Auto Deploy`
   - **URL**: `https://astro-partytown.vercel.app/api/webhook`
   - **Events**: 
     - ✅ entry.create
     - ✅ entry.update  
     - ✅ entry.delete
     - ✅ entry.publish
     - ✅ entry.unpublish

---

## 🔧 故障排除

### 问题1: API 500错误
**原因**: 服务器配置或Token问题
**解决**:
```bash
# 检查Vercel函数日志
vercel logs
```

### 问题2: CORS错误
**原因**: 跨域请求被阻止
**解决**: 已在API响应中添加CORS头部

### 问题3: 构建失败
**原因**: 依赖或配置问题
**解决**:
```bash
# 本地测试构建
npm run build

# 检查Vercel构建日志
```

---

## 🎯 部署检查清单

### ✅ 必须完成项
- [x] Astro配置为Vercel模式
- [x] API端点正常工作
- [x] CORS配置正确
- [x] Webhook端点已创建
- [ ] 在Strapi中配置Webhook URL
- [ ] 测试完整更新流程

### 📊 监控建议
1. **Vercel Analytics**: 监控网站性能
2. **Function Logs**: 检查API调用状态
3. **Deployment History**: 跟踪部署状态

---

## 🚀 下一步

1. **配置Strapi Webhook**: 
   - URL: `https://astro-partytown.vercel.app/api/webhook`
   
2. **测试更新流程**:
   - 在Strapi中修改菜单
   - 检查Vercel函数日志
   - 验证网站更新

3. **性能优化**:
   - 启用Vercel Analytics
   - 配置缓存策略
   - 监控API响应时间

---

## 📞 技术支持

如果遇到问题：
1. 检查Vercel函数日志
2. 验证Strapi API连接
3. 确认Webhook配置正确
4. 测试API端点响应 