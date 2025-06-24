# Webhook自动部署配置

## 🎯 目标
Strapi数据更新后自动触发网站重新构建和部署。

## 🔧 配置步骤

### 1. 在部署平台设置Webhook

#### Vercel部署
1. 进入Vercel项目设置
2. 找到"Git" → "Deploy Hooks"
3. 创建新的Deploy Hook
4. 复制生成的Webhook URL

#### Netlify部署
1. 进入Netlify项目设置  
2. 找到"Build & deploy" → "Build hooks"
3. 创建新的Build hook
4. 复制生成的Webhook URL

### 2. 在Strapi中配置Webhook

#### 方法A: Strapi管理后台
1. 登录Strapi管理后台: `http://47.251.126.80/admin`
2. 进入 `Settings > Webhooks`
3. 点击 "Create new webhook"
4. 配置如下：
   - **Name**: "Deploy Website"
   - **URL**: 粘贴上面复制的Webhook URL
   - **Events**: 勾选以下事件
     - `entry.create` (创建内容时)
     - `entry.update` (更新内容时) 
     - `entry.delete` (删除内容时)
     - `entry.publish` (发布内容时)
     - `entry.unpublish` (取消发布时)
   - **Headers**: 
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_WEBHOOK_SECRET
     ```

#### 方法B: API配置
```bash
curl -X POST http://47.251.126.80/api/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Deploy Website",
    "url": "https://api.vercel.com/v1/integrations/deploy/...",
    "events": ["entry.create", "entry.update", "entry.delete", "entry.publish", "entry.unpublish"]
  }'
```

### 3. 测试Webhook

1. 在Strapi中修改菜单项
2. 保存并发布
3. 检查部署平台是否自动开始构建
4. 等待构建完成(通常2-5分钟)
5. 验证网站是否显示最新数据

## ⏱️ 更新时间线 (配置Webhook后)

1. **0秒**: 在Strapi中修改菜单
2. **1-2秒**: Webhook触发部署
3. **2-5分钟**: 自动构建和部署
4. **完成**: 网站显示最新数据

## 🎯 优势
- ✅ 完全自动化
- ✅ 数据一致性保证
- ✅ 无需手动干预
- ✅ 支持所有静态托管平台 