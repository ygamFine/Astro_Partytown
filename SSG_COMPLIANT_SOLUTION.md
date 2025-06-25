# 🏗️ SSG 合规数据更新解决方案

## ✅ 符合SSG标准的设计原则

### 🔐 安全性
- ❌ **不在客户端暴露敏感Token**
- ❌ **不在浏览器中直接调用需要认证的API**
- ✅ **只使用公共API进行状态检查**
- ✅ **敏感操作只在构建时服务器端执行**

### 🏃‍♂️ 性能优化
- ✅ **构建时预渲染所有内容**
- ✅ **客户端只做轻量级状态检查**
- ✅ **减少API调用频率**
- ✅ **不阻塞首屏渲染**

### 📊 用户体验
- ✅ **显示数据更新提示**
- ✅ **引导用户主动刷新**
- ✅ **透明的状态反馈**

---

## 🔄 当前实现方案

### 1. 构建时数据获取
```javascript
// 构建时在服务器端安全获取数据
export async function getMenus() {
  const response = await fetch(`${STRAPI_BASE_URL}/menus`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`, // 仅服务器端使用
      'Content-Type': 'application/json'
    }
  });
  // 处理并返回静态数据
}
```

### 2. 客户端状态检查
```javascript
// 客户端只检查公共API状态
async function checkForUpdates() {
  const response = await fetch(`${PUBLIC_API_BASE}/menus?populate=*`, {
    method: 'GET', // 无需Token的只读请求
    cache: 'no-cache'
  });
  
  // 只比较更新时间，不获取敏感数据
  const latestUpdate = Math.max(...menus.map(item => 
    new Date(item.updatedAt || item.publishedAt).getTime()
  ));
  
  return latestUpdate > BUILD_TIME;
}
```

### 3. 用户友好的更新机制
```javascript
// 发现更新时提示用户刷新，而非直接更新DOM
if (hasUpdates) {
  showRefreshNotification(); // "发现数据更新，点击刷新"
}
```

---

## ⏱️ 更新时间线

### 🚀 自动重建流程 (主要方式)
1. **0秒**: Strapi中修改数据
2. **1-10分钟**: GitHub Actions定时触发重建
3. **2-3分钟**: 构建完成，部署更新
4. **完成**: 所有用户看到最新数据

### 👁️ 客户端检查流程 (辅助提示)
1. **用户访问页面**: 显示构建时的静态数据
2. **5秒后**: 后台检查是否有更新
3. **发现更新**: 显示蓝色提示 "发现数据更新，点击刷新"
4. **用户点击**: 刷新页面获取最新构建版本

---

## 📋 配置清单

### ✅ GitHub Actions定时构建
```yaml
schedule:
  # 每10分钟检查一次更新
  - cron: '*/10 * * * *'
```

### ✅ 客户端检查频率
- **首次检查**: 页面加载后5秒
- **定期检查**: 每10分钟一次
- **焦点恢复**: 用户切换回页面时

### ✅ API权限设置
- **构建时**: 使用完整Token获取数据
- **客户端**: 只访问公共只读API
- **敏感操作**: 仅在服务器端执行

---

## 🎯 优势

### 🔒 安全性
- Token不暴露给客户端
- 符合SSG安全最佳实践
- 防止API滥用

### ⚡ 性能
- 静态内容秒级加载
- 客户端检查不影响首屏
- CDN缓存友好

### 🔄 可靠性
- 双重更新机制
- 定时重建作为后备
- 用户可主动刷新

### 👥 用户体验
- 立即显示内容 (构建时数据)
- 透明的更新提示
- 用户控制更新时机

---

## 🚨 重要说明

### ❌ 不要这样做
```javascript
// 错误：在客户端使用敏感Token
fetch('/api/strapi', {
  headers: { 'Authorization': `Bearer ${SECRET_TOKEN}` }
});

// 错误：直接更新DOM绕过SSG
document.getElementById('menu').innerHTML = newContent;
```

### ✅ 正确做法
```javascript
// 正确：只检查公共状态
fetch('/api/public/status');

// 正确：提示用户刷新
showRefreshNotification();

// 正确：构建时获取数据
// 在Astro组件的顶层获取数据
```

---

## 📚 相关文档

- [Astro SSG最佳实践](https://docs.astro.build/zh-cn/guides/routing/)
- [静态站点安全指南](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [GitHub Actions定时任务](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)

---

## 🔧 故障排除

### Q: 为什么不直接在客户端更新数据？
A: 这不符合SSG原则，会导致安全风险和性能问题。

### Q: 如何处理API认证？
A: 只在构建时使用认证，客户端只访问公共API。

### Q: 更新太慢怎么办？
A: 可以调整GitHub Actions的触发频率，但建议不低于5分钟。

### Q: 用户不点击刷新怎么办？
A: 定时重建保证最多10分钟内自动更新，无需用户操作。 