# 🚀 Vercel + Strapi Webhook 快速配置指南

## 📋 概览
**目标**: 5分钟内完成Vercel部署 + Strapi Webhook自动更新配置

**效果**: Strapi数据更新 → 1-2秒触发 → 2-3分钟完成部署 → 网站自动更新

---

## 🔧 第一步: Vercel部署 (2分钟)

### 1.1 安装Vercel CLI
```bash
npm install -g vercel
```

### 1.2 登录并部署
```bash
# 登录Vercel (会打开浏览器)
vercel login

# 部署到生产环境
vercel --prod
```

**部署过程中的选择:**
- `Set up and deploy?` → **Yes**
- `Which scope?` → 选择您的账户
- `Link to existing project?` → **No** 
- `What's your project's name?` → 输入项目名 (如: `astro-strapi-site`)
- `In which directory is your code located?` → **./** (当前目录)
- `Want to override the settings?` → **No**

### 1.3 记录部署信息
部署完成后，记录以下信息:
- **生产URL**: `https://your-project.vercel.app`
- **项目名**: 在Vercel控制台中显示

---

## 🔗 第二步: 获取Deploy Hook (1分钟)

### 2.1 进入Vercel Dashboard
1. 访问: https://vercel.com/dashboard
2. 点击您刚创建的项目

### 2.2 创建Deploy Hook
1. 点击 **Settings** 标签
2. 左侧菜单选择 **Git**
3. 找到 **Deploy Hooks** 部分
4. 点击 **Create Hook**
5. 填写配置:
   - **Hook Name**: `Strapi Content Update`
   - **Git Branch**: `main` (或您的默认分支)
6. 点击 **Create Hook**
7. **复制生成的URL** (类似: `https://api.vercel.com/v1/integrations/deploy/prj_abc123/xyz789`)

---

## 🎯 第三步: 配置Strapi Webhook (2分钟)

### 方法A: 通过管理后台 (推荐)

#### 3.1 登录Strapi
访问: http://47.251.126.80/admin

#### 3.2 创建Webhook
1. 左侧菜单 → **Settings** → **Webhooks**
2. 点击 **Create new webhook**
3. 填写配置:

**基本信息:**
- **Name**: `Deploy to Vercel`
- **URL**: 粘贴第二步复制的Deploy Hook URL

**触发事件 (Events):**
勾选以下事件:
- ✅ `entry.create`
- ✅ `entry.update` 
- ✅ `entry.delete`
- ✅ `entry.publish`
- ✅ `entry.unpublish`

**Headers (可选):**
```
Content-Type: application/json
```

4. 点击 **Save**

### 方法B: 使用API命令

如果管理后台不可用，使用以下命令:

```bash
# 替换 YOUR_DEPLOY_HOOK_URL 为实际的Hook URL
curl -X POST "http://47.251.126.80/api/webhooks" \
  -H "Authorization: Bearer 2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Deploy to Vercel",
    "url": "YOUR_DEPLOY_HOOK_URL",
    "events": ["entry.create", "entry.update", "entry.delete", "entry.publish", "entry.unpublish"]
  }'
```

---

## 🧪 第四步: 测试自动部署

### 4.1 测试Webhook连接
```bash
# 手动触发部署 (替换为您的实际URL)
curl -X POST "YOUR_DEPLOY_HOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": "manual trigger"}'
```

### 4.2 完整流程测试

#### 步骤1: 修改Strapi数据
1. 登录 http://47.251.126.80/admin
2. 进入 **Content Manager** → **Menu**
3. 编辑任意菜单项 (如: "首页" → "首页-测试")
4. 点击 **Save** 并 **Publish**

#### 步骤2: 监控部署
1. 立即查看Vercel Dashboard: https://vercel.com/dashboard
2. 进入您的项目
3. 查看 **Deployments** 标签
4. 应该看到新的部署开始 (状态: Building → Ready)

#### 步骤3: 验证结果
1. 等待部署完成 (通常2-3分钟)
2. 访问您的网站: `https://your-project.vercel.app`
3. 检查菜单是否显示为 "首页-测试"
4. ✅ 成功! 自动更新已配置完成

---

## ⏱️ 预期时间线

配置完成后，每次数据更新的流程:

1. **0秒**: 在Strapi中修改并发布内容
2. **1-2秒**: Webhook触发Vercel部署
3. **30秒**: Vercel开始构建
4. **2-3分钟**: 构建完成，网站更新
5. **完成**: 全球CDN缓存刷新

---

## 🔧 故障排除

### 问题1: Webhook未触发
**检查清单:**
- [ ] Webhook URL是否正确
- [ ] Strapi中是否勾选了正确的事件
- [ ] 内容是否已"发布"(Published)

**解决方法:**
```bash
# 检查Webhook配置
curl -X GET "http://47.251.126.80/api/webhooks" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 问题2: 部署失败
**检查位置:**
1. Vercel Dashboard → 项目 → Deployments
2. 点击失败的部署查看错误日志

**常见原因:**
- 构建命令错误
- 依赖安装失败
- API连接超时

### 问题3: 网站未更新
**可能原因:**
- 浏览器缓存 (Ctrl+F5强制刷新)
- CDN缓存延迟 (等待1-2分钟)
- 构建过程中API调用失败

---

## 🎯 优化建议

### 1. 设置构建通知
在Vercel项目设置中:
- **Settings** → **Git** → **Ignored Build Step**
- 配置构建成功/失败的邮件通知

### 2. 环境变量配置
如果需要其他环境变量:
- **Settings** → **Environment Variables**
- 添加 `STRAPI_URL` 和 `STRAPI_TOKEN`

### 3. 自定义域名
- **Settings** → **Domains**
- 添加您的自定义域名

### 4. 性能监控
- 启用 **Analytics** 查看网站性能
- 设置 **Speed Insights** 监控加载速度

---

## 📊 成功指标

配置成功后，您应该看到:

✅ **Vercel部署状态**: Ready  
✅ **Webhook响应**: 200 OK  
✅ **构建时间**: < 3分钟  
✅ **更新延迟**: < 5分钟  
✅ **网站可访问**: 全球CDN加速  

---

## 🚀 下一步

配置完成后，您可以:

1. **邀请团队成员**: 让内容编辑者直接在Strapi中管理内容
2. **设置多环境**: 配置开发/测试/生产环境
3. **添加更多内容类型**: 产品、新闻、案例等
4. **配置备份**: 定期备份Strapi数据
5. **监控优化**: 设置性能监控和错误追踪

**恭喜！您的网站现在已经实现了内容管理系统(CMS)驱动的自动更新！** 🎉 