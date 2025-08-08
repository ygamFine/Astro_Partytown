import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 动态获取语言列表：扫描 src/i18n/locales 目录
function getSupportedLanguagesFromFs() {
  const localesRoot = path.join(__dirname, '..', 'src', 'i18n', 'locales');
  const langs = [];
  try {
    const entries = fs.readdirSync(localesRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const langDir = path.join(localesRoot, entry.name);
        const commonFile = path.join(langDir, 'common.json');
        if (fs.existsSync(commonFile)) {
          langs.push(entry.name);
        }
      }
    }
  } catch (e) {
    // 忽略
  }
  return langs.length > 0 ? langs : ['en'];
}

const SUPPORTED_LANGUAGES = getSupportedLanguagesFromFs();

// 命名空间列表
const NAMESPACES = ['common', 'about', 'contact', 'product', 'news', 'case', 'breadcrumb', 'pagination', 'form'];

// 读取翻译文件
function loadTranslationFile(lang, namespace) {
  try {
    const filePath = path.join(__dirname, '..', 'src', 'i18n', 'locales', lang, `${namespace}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`Warning: Could not load ${lang}/${namespace}.json`);
  }
  return {};
}

// 将嵌套对象转换为扁平化的键值对
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

// 生成新的翻译数据
function generateTranslations() {
  const translations = {};
  
  for (const lang of SUPPORTED_LANGUAGES) {
    translations[lang] = {};
    
    for (const namespace of NAMESPACES) {
      const data = loadTranslationFile(lang, namespace);
      if (Object.keys(data).length > 0) {
        translations[lang][namespace] = flattenObject(data);
      }
    }
  }
  
  return translations;
}

// 生成 TypeScript 代码
function generateTypeScriptCode(translations) {
  let code = `export default function getDictionary(lang: string): Record<string, string> {
  return {
    // 通用翻译
    'nav.home': getTranslation(lang, 'common', 'nav.home'),
    'nav.about': getTranslation(lang, 'common', 'nav.about'),
    'nav.products': getTranslation(lang, 'common', 'nav.products'),
    'nav.news': getTranslation(lang, 'common', 'nav.news'),
    'nav.case': getTranslation(lang, 'common', 'nav.case'),
    'nav.contact': getTranslation(lang, 'common', 'nav.contact'),
    'nav.search': getTranslation(lang, 'common', 'nav.search'),
    
    // 占位符
    'placeholder.name': getTranslation(lang, 'common', 'placeholders.name'),
    'placeholder.email': getTranslation(lang, 'common', 'placeholders.email'),
    'placeholder.phone': getTranslation(lang, 'common', 'placeholders.phone'),
    'placeholder.telephone': getTranslation(lang, 'common', 'placeholders.telephone'),
    'placeholder.company': getTranslation(lang, 'common', 'placeholders.company'),
    'placeholder.subject': getTranslation(lang, 'common', 'placeholders.subject'),
    'placeholder.message': getTranslation(lang, 'common', 'placeholders.message'),
    'placeholder.content': getTranslation(lang, 'common', 'placeholders.content'),
    'placeholder.title': getTranslation(lang, 'common', 'placeholders.title'),
    'placeholder.description': getTranslation(lang, 'common', 'placeholders.description'),
    'placeholder.search': getTranslation(lang, 'common', 'placeholders.search'),
    'placeholder.keyword': getTranslation(lang, 'common', 'placeholders.keyword'),
    'placeholder.captcha': getTranslation(lang, 'common', 'placeholders.captcha'),
    'placeholder.password': getTranslation(lang, 'common', 'placeholders.password'),
    'placeholder.confirm_password': getTranslation(lang, 'common', 'placeholders.confirm_password'),
    'placeholder.address': getTranslation(lang, 'common', 'placeholders.address'),
    'placeholder.city': getTranslation(lang, 'common', 'placeholders.city'),
    'placeholder.country': getTranslation(lang, 'common', 'placeholders.country'),
    'placeholder.zip_code': getTranslation(lang, 'common', 'placeholders.zip_code'),
    'placeholder.website': getTranslation(lang, 'common', 'placeholders.website'),
    'placeholder.position': getTranslation(lang, 'common', 'placeholders.position'),
    'placeholder.department': getTranslation(lang, 'common', 'placeholders.department'),
    'placeholder.budget': getTranslation(lang, 'common', 'placeholders.budget'),
    'placeholder.quantity': getTranslation(lang, 'common', 'placeholders.quantity'),
    'placeholder.requirements': getTranslation(lang, 'common', 'placeholders.requirements'),
    'placeholder.inquiry': getTranslation(lang, 'common', 'placeholders.inquiry'),
    'placeholder.feedback': getTranslation(lang, 'common', 'placeholders.feedback'),
    'placeholder.comment': getTranslation(lang, 'common', 'placeholders.comment'),
    'placeholder.question': getTranslation(lang, 'common', 'placeholders.question'),
    
    // 标签
    'label.name': getTranslation(lang, 'common', 'labels.name'),
    'label.email': getTranslation(lang, 'common', 'labels.email'),
    'label.phone': getTranslation(lang, 'common', 'labels.phone'),
    'label.telephone': getTranslation(lang, 'common', 'labels.telephone'),
    'label.company': getTranslation(lang, 'common', 'labels.company'),
    'label.subject': getTranslation(lang, 'common', 'labels.subject'),
    'label.message': getTranslation(lang, 'common', 'labels.message'),
    'label.content': getTranslation(lang, 'common', 'labels.content'),
    'label.title': getTranslation(lang, 'common', 'labels.title'),
    'label.description': getTranslation(lang, 'common', 'labels.description'),
    'label.search': getTranslation(lang, 'common', 'labels.search'),
    'label.keyword': getTranslation(lang, 'common', 'labels.keyword'),
    'label.captcha': getTranslation(lang, 'common', 'labels.captcha'),
    'label.password': getTranslation(lang, 'common', 'labels.password'),
    'label.confirm_password': getTranslation(lang, 'common', 'labels.confirm_password'),
    'label.address': getTranslation(lang, 'common', 'labels.address'),
    'label.city': getTranslation(lang, 'common', 'labels.city'),
    'label.country': getTranslation(lang, 'common', 'labels.country'),
    'label.zip_code': getTranslation(lang, 'common', 'labels.zip_code'),
    'label.website': getTranslation(lang, 'common', 'labels.website'),
    'label.position': getTranslation(lang, 'common', 'labels.position'),
    'label.department': getTranslation(lang, 'common', 'labels.department'),
    'label.budget': getTranslation(lang, 'common', 'labels.budget'),
    'label.quantity': getTranslation(lang, 'common', 'labels.quantity'),
    'label.requirements': getTranslation(lang, 'common', 'labels.requirements'),
    'label.inquiry': getTranslation(lang, 'common', 'labels.inquiry'),
    'label.feedback': getTranslation(lang, 'common', 'labels.feedback'),
    'label.comment': getTranslation(lang, 'common', 'labels.comment'),
    'label.question': getTranslation(lang, 'common', 'labels.question'),
    
    // 验证
    'validation.required': getTranslation(lang, 'common', 'validation.required'),
    'validation.email_invalid': getTranslation(lang, 'common', 'validation.email_invalid'),
    'validation.phone_invalid': getTranslation(lang, 'common', 'validation.phone_invalid'),
    'validation.min_length': getTranslation(lang, 'common', 'validation.min_length'),
    'validation.max_length': getTranslation(lang, 'common', 'validation.max_length'),
    'validation.password_mismatch': getTranslation(lang, 'common', 'validation.password_mismatch'),
    'validation.captcha_invalid': getTranslation(lang, 'common', 'validation.captcha_invalid'),
    'validation.invalid_format': getTranslation(lang, 'common', 'validation.invalid_format'),
    'validation.no_results': getTranslation(lang, 'common', 'validation.no_results'),
    'validation.search_error': getTranslation(lang, 'common', 'validation.search_error'),
    
    // 按钮
    'button.submit': getTranslation(lang, 'common', 'buttons.submit'),
    'button.send': getTranslation(lang, 'common', 'buttons.send'),
    'button.save': getTranslation(lang, 'common', 'buttons.save'),
    'button.cancel': getTranslation(lang, 'common', 'buttons.cancel'),
    'button.reset': getTranslation(lang, 'common', 'buttons.reset'),
    'button.clear': getTranslation(lang, 'common', 'buttons.clear'),
    'button.search': getTranslation(lang, 'common', 'buttons.search'),
    'button.filter': getTranslation(lang, 'common', 'buttons.filter'),
    'button.apply': getTranslation(lang, 'common', 'buttons.apply'),
    'button.confirm': getTranslation(lang, 'common', 'buttons.confirm'),
    'button.delete': getTranslation(lang, 'common', 'buttons.delete'),
    'button.edit': getTranslation(lang, 'common', 'buttons.edit'),
    'button.update': getTranslation(lang, 'common', 'buttons.update'),
    'button.add': getTranslation(lang, 'common', 'buttons.add'),
    'button.remove': getTranslation(lang, 'common', 'buttons.remove'),
    'button.download': getTranslation(lang, 'common', 'buttons.download'),
    'button.upload': getTranslation(lang, 'common', 'buttons.upload'),
    'button.preview': getTranslation(lang, 'common', 'buttons.preview'),
    'button.publish': getTranslation(lang, 'common', 'buttons.publish'),
    'button.draft': getTranslation(lang, 'common', 'buttons.draft'),
    'button.view_all': getTranslation(lang, 'common', 'buttons.view_all'),
    'button.load_more': getTranslation(lang, 'common', 'buttons.load_more'),
    'button.back': getTranslation(lang, 'common', 'buttons.back'),
    'button.next': getTranslation(lang, 'common', 'buttons.next'),
    
    // 关于页面
    'about.title': getTranslation(lang, 'about', 'title'),
    'about.subtitle': getTranslation(lang, 'about', 'subtitle'),
    'about.description': getTranslation(lang, 'about', 'description'),
    
    // 联系页面
    'contact.title': getTranslation(lang, 'contact', 'title'),
    'contact.subtitle': getTranslation(lang, 'contact', 'subtitle'),
    'contact.description': getTranslation(lang, 'contact', 'description'),
    'contact.address': getTranslation(lang, 'contact', 'address'),
    'contact.phone': getTranslation(lang, 'contact', 'phone'),
    'contact.email': getTranslation(lang, 'contact', 'email'),
    'contact.working_hours': getTranslation(lang, 'contact', 'working_hours'),
    
    // 产品页面
    'product.title': getTranslation(lang, 'product', 'title'),
    'product.subtitle': getTranslation(lang, 'product', 'subtitle'),
    'product.description': getTranslation(lang, 'product', 'description'),
    'product.view_details': getTranslation(lang, 'product', 'view_details'),
    'product.inquire_now': getTranslation(lang, 'product', 'inquire_now'),
    'product.specifications': getTranslation(lang, 'product', 'specifications'),
    'product.features': getTranslation(lang, 'product', 'features'),
    'product.applications': getTranslation(lang, 'product', 'applications'),
    
    // 新闻页面
    'news.title': getTranslation(lang, 'news', 'title'),
    'news.subtitle': getTranslation(lang, 'news', 'subtitle'),
    'news.description': getTranslation(lang, 'news', 'description'),
    'news.read_more': getTranslation(lang, 'news', 'read_more'),
    'news.published_date': getTranslation(lang, 'news', 'published_date'),
    'news.author': getTranslation(lang, 'news', 'author'),
    'news.category': getTranslation(lang, 'news', 'category'),
    
    // 案例页面
    'case.title': getTranslation(lang, 'case', 'title'),
    'case.subtitle': getTranslation(lang, 'case', 'subtitle'),
    'case.description': getTranslation(lang, 'case', 'description'),
    'case.view_case': getTranslation(lang, 'case', 'view_case'),
    'case.customer': getTranslation(lang, 'case', 'customer'),
    'case.location': getTranslation(lang, 'case', 'location'),
    'case.date': getTranslation(lang, 'case', 'date'),
    
    // 面包屑
    'breadcrumb.home': getTranslation(lang, 'breadcrumb', 'home'),
    'breadcrumb.about': getTranslation(lang, 'breadcrumb', 'about'),
    'breadcrumb.products': getTranslation(lang, 'breadcrumb', 'products'),
    'breadcrumb.news': getTranslation(lang, 'breadcrumb', 'news'),
    'breadcrumb.case': getTranslation(lang, 'breadcrumb', 'case'),
    'breadcrumb.contact': getTranslation(lang, 'breadcrumb', 'contact'),
    'breadcrumb.search': getTranslation(lang, 'breadcrumb', 'search'),
    
    // 分页
    'pagination.previous': getTranslation(lang, 'pagination', 'previous'),
    'pagination.next': getTranslation(lang, 'pagination', 'next'),
    'pagination.page': getTranslation(lang, 'pagination', 'page'),
    'pagination.of': getTranslation(lang, 'pagination', 'of'),
    'pagination.showing': getTranslation(lang, 'pagination', 'showing'),
    'pagination.to': getTranslation(lang, 'pagination', 'to'),
    'pagination.of_total': getTranslation(lang, 'pagination', 'of_total'),
    'pagination.entries': getTranslation(lang, 'pagination', 'entries'),
    
    // 表单
    'form.title': getTranslation(lang, 'form', 'title'),
    'form.subtitle': getTranslation(lang, 'form', 'subtitle'),
    'form.description': getTranslation(lang, 'form', 'description'),
    'form.success_message': getTranslation(lang, 'form', 'success_message'),
    'form.error_message': getTranslation(lang, 'form', 'error_message'),
    'form.required_fields': getTranslation(lang, 'form', 'required_fields'),
    'form.optional_fields': getTranslation(lang, 'form', 'optional_fields'),
  };
}

// 翻译数据
const translations: Record<string, Record<string, Record<string, string>>> = ${JSON.stringify(translations, null, 2)};

function getTranslation(lang: string, namespace: string, key: string): string {
  try {
    return translations[lang]?.[namespace]?.[key] || 
           translations['en']?.[namespace]?.[key] || 
           key;
  } catch {
    return key;
  }
}`;

  return code;
}

// 主函数
function main() {
  console.log('开始转换翻译文件...');
  
  const translations = generateTranslations();
  const tsCode = generateTypeScriptCode(translations);
  
  // 写入新的翻译文件
  const outputPath = path.join(__dirname, '..', 'src', 'i18n', 'dictionaries.ts');
  fs.writeFileSync(outputPath, tsCode, 'utf8');
  
  console.log(`翻译文件已生成: ${outputPath}`);
  console.log(`支持的语言: ${SUPPORTED_LANGUAGES.join(', ')}`);
  console.log(`命名空间: ${NAMESPACES.join(', ')}`);
}

main(); 