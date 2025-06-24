# ✅ Webhook自动部署配置清单

## 🎯 目标
**实现效果**: Strapi数据更新后，网站在2-5分钟内自动更新

---

## 📋 配置清单

### ✅ 第一阶段：选择部署平台

**推荐顺序:**
1. 🥇 **Vercel** - 最简单，速度最快
2. 🥈 **Netlify** - 功能丰富，稳定可靠  
3. 🥉 **GitHub Pages** - 完全免费

### ✅ 第二阶段：完成部署

#### 选择Vercel (推荐)
```bash
# 1. 安装CLI
npm install -g vercel

# 2. 登录并部署
vercel login
vercel --prod
```

#### 选择Netlify
```bash
# 1. 构建项目
npm run build

# 2. 部署 (拖拽dist文件夹到netlify.com)
# 或使用CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

#### 选择GitHub Pages
```bash
# 1. 推送代码到GitHub
git add .
git commit -m "配置GitHub Pages部署"
git push origin main

# 2. 在仓库设置中启用Pages (Source: GitHub Actions)
```

### ✅ 第三阶段：获取Webhook URL

#### Vercel
1. 访问 https://vercel.com/dashboard
2. 选择项目 → Settings → Git → Deploy Hooks
3. Create Hook → 复制URL

#### Netlify  
1. 访问 https://app.netlify.com/
2. 选择网站 → Site settings → Build & deploy → Build hooks
3. Add build hook → 复制URL

#### GitHub Pages
1. 创建Personal Access Token
2. URL格式: `https://api.github.com/repos/[USER]/[REPO]/dispatches`

### ✅ 第四阶段：配置Strapi Webhook

#### 方法1: 管理后台 (推荐)
1. 访问: http://47.251.126.80/admin
2. Settings → Webhooks → Create new webhook
3. 填写配置:
   - **Name**: `Deploy Website`
   - **URL**: 粘贴Webhook URL
   - **Events**: 勾选 create, update, delete, publish, unpublish
4. Save

#### 方法2: API命令
```bash
# Vercel示例 (替换URL)
curl -X POST "http://47.251.126.80/api/webhooks" \
  -H "Authorization: Bearer 2980bc69d09c767b2ca2e1c211a285c9f48985775a3f1d1313025838a611abbfe6d892a29b3417407ddd798d69a9f67f063c27d13827c1765f96b4bc19601295ac11fb9552f4a16ede2745813e3b536827069875ae8c5089a36da57cf69d08b252093e2100e0cc88ac700ca6cd6ebd196f0002bd5fb8219222ed778f8858ad21" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Deploy Website",
    "url": "YOUR_WEBHOOK_URL",
    "events": ["entry.create", "entry.update", "entry.delete", "entry.publish", "entry.unpublish"]
  }'
```

### ✅ 第五阶段：测试验证

#### 5.1 手动测试Webhook
```bash
# 替换为实际的Webhook URL
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": "manual trigger"}'
```

#### 5.2 完整流程测试
1. **修改Strapi数据**: 登录管理后台，编辑菜单项
2. **监控部署**: 查看部署平台的构建状态
3. **验证网站**: 访问网站确认更新

---

## 🔧 生成的文件说明

### 配置文件
- ✅ `vercel.json` - Vercel部署配置
- ✅ `netlify.toml` - Netlify部署配置  
- ✅ `.github/workflows/deploy.yml` - GitHub Actions工作流

### 文档文件
- 📖 `QUICK_VERCEL_SETUP.md` - Vercel快速配置指南
- 📖 `WEBHOOK_SETUP_GUIDE.md` - 完整配置指南
- 📖 `WEBHOOK_CHECKLIST.md` - 本清单文件

### 测试脚本
- 🧪 `test-vercel-webhook.sh` - Vercel测试脚本
- 🧪 `test-netlify-webhook.sh` - Netlify测试脚本
- 🧪 `test-github-webhook.sh` - GitHub测试脚本

---

## ⏱️ 预期结果

配置成功后的更新时间线:

1. **0秒**: Strapi中修改内容并发布
2. **1-2秒**: Webhook触发部署
3. **30秒-1分钟**: 开始构建
4. **2-5分钟**: 构建完成，网站更新
5. **完成**: 全球用户看到最新内容

---

## 🚨 重要提醒

### 必须完成的步骤
1. ✅ 选择并完成网站部署
2. ✅ 获取真实的Webhook URL (不是模板URL)
3. ✅ 在Strapi中正确配置Webhook
4. ✅ 测试完整的更新流程

### 常见错误
- ❌ 使用模板URL而非真实URL
- ❌ 忘记勾选Webhook事件
- ❌ 内容保存后未点击"发布"
- ❌ 浏览器缓存导致看不到更新

---

## 🎉 成功标志

当您看到以下情况时，说明配置成功:

✅ **部署平台显示**: 构建成功 (Ready/Published)  
✅ **Strapi显示**: Webhook调用成功  
✅ **网站显示**: 修改后的内容  
✅ **时间线**: 5分钟内完成整个流程  

---

**准备好了吗？选择一个部署平台开始配置吧！** 🚀

**推荐从 [QUICK_VERCEL_SETUP.md](./QUICK_VERCEL_SETUP.md) 开始，这是最简单的方案。** 