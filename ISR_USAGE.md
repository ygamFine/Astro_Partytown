# ISR 使用方法

## 快速开始

### 1. 部署到Vercel
```bash
# 推送代码到GitHub
git add .
git commit -m "Add ISR support"
git push

# 在Vercel中导入项目并设置环境变量
```

### 2. 设置环境变量
在Vercel项目设置中添加：
```
BYPASS_TOKEN=your-secure-token-here
STRAPI_WEBHOOK_SECRET=your-webhook-secret
```

### 3. 配置Strapi Webhook
1. 进入Strapi管理面板 → Settings → Global Settings → Webhooks
2. 添加新webhook：
   - **Name**: Astro ISR
   - **URL**: `https://your-domain.com/api/webhook`
   - **Events**: 选择 `entry.publish`, `entry.update`

## 使用方法

### 手动重新验证页面
```bash
curl -X POST "https://your-domain.com/api/revalidate?token=your-token&path=/en/products"
```

### 重新验证多个页面
```bash
# 产品页面
curl -X POST "https://your-domain.com/api/revalidate?token=your-token&path=/en/products/123"

# 新闻页面
curl -X POST "https://your-domain.com/api/revalidate?token=your-token&path=/en/news/456"

# 首页
curl -X POST "https://your-domain.com/api/revalidate?token=your-token&path=/en"
```

### 自动重新验证
当Strapi内容更新时，webhook会自动触发重新验证：
- 产品更新 → 重新验证产品相关页面
- 新闻更新 → 重新验证新闻相关页面
- 案例更新 → 重新验证案例相关页面

## 测试

### 测试重新验证端点
```bash
curl -X GET "https://your-domain.com/api/revalidate"
# 应该返回: "Revalidation endpoint"
```

### 测试Webhook端点
```bash
curl -X GET "https://your-domain.com/api/webhook"
# 应该返回: "Webhook endpoint"
```

## 故障排除

### 重新验证失败
- 检查 `BYPASS_TOKEN` 是否正确
- 确认路径格式正确（如 `/en/products`）
- 查看Vercel函数日志

### Webhook不工作
- 检查Strapi webhook配置
- 确认URL可访问
- 验证webhook密钥

## 安全提示
- 使用强密码作为 `BYPASS_TOKEN`
- 定期轮换密钥
- 监控API访问日志 