# Astro + Partytown 项目

## 国际化系统迁移完成

本项目已成功从自定义国际化系统迁移到 Astro 内置的 i18n 系统。

### 🎉 迁移完成状态

- ✅ **配置文件更新**: `astro.config.mjs` 已配置支持 22 种语言
- ✅ **翻译文件转换**: 所有翻译文件已转换为新的扁平化结构
- ✅ **页面更新**: 所有页面已更新为使用新的国际化系统
- ✅ **工具函数更新**: 所有工具函数已更新为使用新的语言配置
- ✅ **构建成功**: 项目可以成功构建并生成所有语言版本的页面

### 🌍 支持的语言

- 英语 (en) - 默认语言
- 简体中文 (zh-Hans)
- 繁體中文 (zh-Hant)
- 法语 (fr)
- 德语 (de)
- 意大利语 (it)
- 土耳其语 (tr)
- 西班牙语 (es)
- 葡萄牙语 (pt-pt)
- 荷兰语 (nl)
- 波兰语 (pl)
- 阿拉伯语 (ar)
- 俄语 (ru)
- 泰语 (th)
- 印尼语 (id)
- 越南语 (vi)
- 马来语 (ms)
- 马拉雅拉姆语 (ml)
- 缅甸语 (my)
- 印地语 (hi)
- 日语 (ja)
- 韩语 (ko)

### 📁 新的文件结构

```
src/
├── i18n/
│   └── dictionaries.ts                    # 新的翻译文件（扁平化结构）
├── lib/
│   └── i18n-routes.js          # 新的路由生成工具
└── pages/
    └── [lang]/                 # 语言路由保持不变
        ├── index.astro         # 首页
        ├── about.astro         # 关于页面
        ├── contact.astro       # 联系页面
        ├── search.astro        # 搜索页面
        ├── products/           # 产品页面
        ├── news/               # 新闻页面
        └── case/               # 案例页面
```

### 🔧 主要变化

1. **翻译文件结构**: 从嵌套 JSON 转换为扁平化的键值对
2. **导入方式**: 使用 `getDictionary(lang)` 函数获取翻译
3. **路由生成**: 使用 `generateStaticPaths()` 统一生成所有语言路由
4. **配置管理**: 语言列表集中在 `i18n-routes.js` 中管理

### 🚀 使用方法

#### 在页面中使用翻译

```astro
---
import getDictionary from '../../i18n/dictionaries.js';
import { generateStaticPaths } from '../../lib/i18n-routes.js';

export async function getStaticPaths() {
  return generateStaticPaths();
}

const { lang } = Astro.params;
const ui = getDictionary(lang);
---

<Layout title={ui['nav.home']} lang={lang}>
  <h1>{ui['nav.home']}</h1>
</Layout>
```

#### 添加新翻译

1. 在 `src/i18n/locales/[lang]/[namespace].json` 中添加翻译
2. 在页面中使用新的翻译键

### ⚠️ 注意事项

1. **图片优化警告**: 构建过程中出现"文件名太长"的警告，这是由于图片优化脚本重复添加"mobile"后缀导致的，不影响国际化功能
2. **翻译键命名**: 使用点分隔的命名方式，如 `nav.home`、`button.submit`
3. **回退机制**: 如果某个翻译不存在，会自动回退到英语翻译

### 🎯 优势

1. **更好的性能**: Astro 内置的 i18n 系统经过优化
2. **更简洁的代码**: 减少了样板代码
3. **更好的类型支持**: TypeScript 集成更完善
4. **自动路由生成**: 无需手动管理语言路由
5. **SEO 友好**: 更好的 URL 结构和元数据支持

### 📊 构建统计

- 总页面数: 22 种语言 × 多个页面类型
- 构建时间: ~1.76s
- 生成文件: 所有语言版本的静态 HTML 文件

### 🔄 后续维护

1. 添加新翻译时运行转换脚本
2. 新页面使用 `generateStaticPaths()` 生成路由
3. 使用 `getDictionary(lang)` 获取翻译
4. 保持翻译键的命名一致性

---

**迁移完成时间**: 2024年1月
**状态**: ✅ 完成
