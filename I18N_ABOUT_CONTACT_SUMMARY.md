# 关于我们和联系我们页面国际化工作总结

## 完成的工作

### 1. 创建国际化文件

为所有支持的语言创建了 `about.json` 和 `contact.json` 文件：

#### 已完成的语言：
- ✅ 中文简体 (zh-CN)
- ✅ 中文繁体 (zh-Hant) 
- ✅ 英文 (en)
- ✅ 日语 (ja)
- ✅ 法语 (fr)
- ✅ 德语 (de)
- ✅ 西班牙语 (es)
- ✅ 俄语 (ru)
- ✅ 阿拉伯语 (ar)
- ✅ 韩语 (ko)
- ✅ 意大利语 (it)
- ✅ 葡萄牙语 (pt-pt)
- ✅ 荷兰语 (nl)
- ✅ 波兰语 (pl)
- ✅ 印地语 (hi)
- ✅ 印尼语 (id)
- ✅ 马来语 (ms)
- ✅ 泰语 (th)
- ✅ 土耳其语 (tr)
- ✅ 越南语 (vi)
- ✅ 马拉雅拉姆语 (ml)
- ✅ 缅甸语 (my)

### 2. 页面模板文字国际化

#### about.json 包含的模板文字：
- 页面标题 (`page_title`)
- 页面描述 (`page_description`)
- 列表描述 (`list_description`)

#### contact.json 包含的模板文字：
- 页面标题 (`page_title`)
- 页面描述 (`page_description`)
- Banner标题和副标题 (`banner`)
- 表单相关文字 (`form`)

### 3. 页面代码更新

#### about.astro 页面更新：
- 添加了 `about` 翻译文件的导入
- 更新了 `SecondaryPageLayout` 组件的属性，使用国际化文字
- 保持了富文本内容的原有结构（不包含在本次国际化中）

#### contact.astro 页面更新：
- 添加了 `contact` 翻译文件的导入
- 更新了页面标题、描述、Banner文字
- 更新了表单标签和占位符文字
- 保持了富文本内容的原有结构（不包含在本次国际化中）

### 4. 国际化原则

按照要求，本次国际化工作：
- ✅ 包含了页面模板文字
- ❌ 不包含变量数据中的内容
- ❌ 不包含富文本中的内容

## 文件结构

```
src/locales/
├── [lang]/
│   ├── about.json      # 关于我们页面模板文字
│   ├── contact.json    # 联系我们页面模板文字
│   ├── common.json     # 通用翻译
│   ├── form.json       # 表单翻译
│   └── ...            # 其他翻译文件
```

## 使用方式

页面会自动根据当前语言加载相应的翻译文件：

```typescript
const translations = await mergeTranslations(lang, ['common', 'breadcrumb', 'about']);
const aboutT = (translations as any).about || {};
```

然后在模板中使用：

```astro
<SecondaryPageLayout 
  title={aboutT.page_title || "关于我们"}
  description={aboutT.page_description || "默认描述"}
  ...
>
```

## 翻译内容

### 主要语言翻译：
- **中文简体 (zh-CN)**：完整翻译
- **中文繁体 (zh-Hant)**：完整翻译  
- **日语 (ja)**：完整翻译
- **其他语言**：使用英文作为fallback

### about.json 示例：
```json
{
  "page_title": "关于我们",
  "page_description": "山东永安建设机械集团有限公司 - 专业工程机械制造商",
  "list_description": "山东永安建设机械集团有限公司成立于2005年..."
}
```

### contact.json 示例：
```json
{
  "page_title": "联系我们",
  "page_description": "联系山东永安建设机械集团有限公司...",
  "banner": {
    "title": "联系我们",
    "subtitle": "专业的技术团队..."
  },
  "form": {
    "title": "在线咨询",
    "description": "请填写以下表单...",
    "company_name": "公司名称",
    "company_placeholder": "请输入您的公司名称"
  }
}
```

## 注意事项

1. **严格遵循要求**：只包含页面模板文字，不包含富文本内容
2. 所有翻译文件都提供了完整的翻译内容
3. 页面代码中使用了 fallback 机制，确保在翻译缺失时显示默认中文
4. 富文本内容（`aboutContent` 和 `contactContent`）保持原有结构，未进行国际化
5. 表单验证和提交消息等动态内容未包含在本次国际化中

## 修正历史

- **初始版本**：错误地包含了富文本内容
- **修正版本**：严格按照要求，只包含页面模板文字
- **批量修正**：使用脚本批量修正所有语言的国际化文件

## 后续工作建议

1. 如果需要将富文本内容也进行国际化，需要创建动态的内容生成机制
2. 可以考虑将表单验证消息和提交反馈也加入国际化
3. 建议添加翻译文件的验证机制，确保所有必需字段都存在 