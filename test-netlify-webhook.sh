#!/bin/bash

echo "🧪 测试Netlify自动部署..."

# 1. 测试Webhook URL
echo "📡 测试Webhook URL..."
curl -X POST "https://api.netlify.com/build_hooks/[YOUR_HOOK_ID]" \
  -H "Content-Type: application/json" \
  -d '{"test": "manual trigger"}'

echo ""
echo "✅ Webhook测试完成"

# 2. 监控部署状态
echo "📊 请在以下位置监控部署状态:"
echo "Netlify Dashboard: https://app.netlify.com/"

echo ""
echo "🔄 完整测试流程:"
echo "1. 修改Strapi菜单数据"
echo "2. 观察是否触发自动部署"
echo "3. 等待构建完成(2-5分钟)"
echo "4. 验证网站更新"