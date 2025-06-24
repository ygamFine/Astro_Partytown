# 定时重新构建配置

## 🎯 目标
定期自动重新构建网站，确保数据同步。

## 🔧 配置方案

### 1. GitHub Actions定时构建

#### .github/workflows/scheduled-build.yml
```yaml
name: Scheduled Build

on:
  schedule:
    # 每小时的第0分钟执行 (UTC时间)
    - cron: '0 * * * *'
    # 每天早上8点执行 (UTC时间)
    - cron: '0 8 * * *'
  
  # 手动触发
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
        working-directory: ./
```

### 2. Vercel Cron Jobs

#### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/rebuild",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

#### api/rebuild.js
```javascript
export default async function handler(req, res) {
  try {
    // 触发重新部署
    const response = await fetch(process.env.DEPLOY_HOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      res.status(200).json({ message: '重新构建已触发' });
    } else {
      res.status(500).json({ error: '触发失败' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 3. Netlify定时构建

#### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "netlify-plugin-cron"
  
  [plugins.inputs]
    schedule = "0 */2 * * *"  # 每2小时执行一次
    command = "curl -X POST https://api.netlify.com/build_hooks/YOUR_BUILD_HOOK_ID"
```

## ⏱️ 更新时间线 (定时构建)

### 每小时构建
1. **0-59分钟**: 在Strapi中修改数据
2. **每小时0分**: 自动触发构建
3. **2-5分钟**: 构建和部署完成
4. **完成**: 网站显示最新数据

### 每2小时构建  
- **最快**: 2分钟内更新
- **最慢**: 2小时2分钟内更新
- **平均**: 1小时1分钟内更新

## 🎯 优势
- ✅ 完全自动化
- ✅ 无需手动干预
- ✅ 可预测的更新时间
- ✅ 适合内容更新不频繁的场景

## ⚠️ 注意事项
- 构建资源消耗
- 不是实时更新
- 需要配置部署平台 