// 动态导入翻译文件
import { getSupportedLanguages } from '@utils/languageConfig';

// 翻译命名空间
const TRANSLATION_NAMESPACES = [
  'common', 'breadcrumb', 'about', 'case', 'news', 'contact', 'product', 'form', 'search'
];

// 缓存翻译数据
let cachedTranslationData: Record<string, Record<string, any>> | null = null;

// 动态加载翻译文件
async function loadTranslationFile(lang: string, namespace: string) {
  try {
    const module = await import(`./locales/${lang}/${namespace}.json`);
    return module.default;
  } catch (error) {
    return {};
  }
}

// 动态生成翻译数据映射
async function generateTranslationData() {
  const translationData: Record<string, Record<string, any>> = {};
  const SUPPORTED_LANGUAGES = await getSupportedLanguages();
  
  for (const lang of SUPPORTED_LANGUAGES) {
    translationData[lang] = {};
    
    for (const namespace of TRANSLATION_NAMESPACES) {
      translationData[lang][namespace] = await loadTranslationFile(lang, namespace);
    }
  }
  
  return translationData;
}

// 获取翻译数据的函数
async function getTranslationData() {
  if (!cachedTranslationData) {
    cachedTranslationData = await generateTranslationData();
  }
  return cachedTranslationData;
}

// 翻译函数
function getTranslation(lang: string, namespace: string, key: string, translationData: Record<string, Record<string, any>>): string {
  try {
    const translations = translationData[lang]?.[namespace];
    if (!translations) return key;
    
    const keys = key.split('.');
    let result = translations;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key;
      }
    }
    
    return result || key;
  } catch {
    return key;
  }
}

// 创建翻译辅助函数
function createTranslator(lang: string, translationData: Record<string, Record<string, any>>) {
  return (namespace: string, key: string) => getTranslation(lang, namespace, key, translationData);
}

// 翻译配置对象
const TRANSLATION_CONFIG = {
  // 通用翻译
  common: {
    empty_state: { back_to_home: 'common.empty_state.back_to_home' },
    placeholders: { search: 'common.placeholders.search' },
    pagination: {
      previous: 'common.pagination.previous',
      next: 'common.pagination.next',
      page: 'common.pagination.page',
      to: 'common.pagination.to',
    },
    actions: {
      view: 'common.actions.view',
      add: 'common.actions.add',
      share: 'common.actions.share',
    },
    units: {
      ton: 'common.units.ton',
    },
    product_card: {
      get_quote: 'common.product_card.get_quote',
      contact_now: 'common.product_card.contact_now',
      add_to_cart: 'common.product_card.add_to_cart',
    },
    sidebar: {
      whatsapp: 'common.sidebar.whatsapp',
      phone_consultation: 'common.sidebar.phone_consultation',
      email_consultation: 'common.sidebar.email_consultation',
      qq_consultation: 'common.sidebar.qq_consultation',
      back_to_top: 'common.sidebar.back_to_top',
      whatsapp_message: 'common.sidebar.whatsapp_message',
    },
  },
  empty_state: { back_to_home: 'case.empty_state.back_to_home' },
  breadcrumb: {
    home: 'breadcrumb.home',
    products: 'breadcrumb.products',
    news: 'breadcrumb.news',
    case: 'breadcrumb.case',
  },
  nav: { home: 'breadcrumb.home' },
  placeholder: { search: 'common.placeholders.search' },
  about: { title: 'about.page_title' },
  case: {
    title: 'case.case.title',
    related: {
      cases: 'case.related.cases',
      news: 'case.related.news',
      view_more: 'case.related.view_more',
    },
    empty_state: {
      no_cases_title: 'case.empty_state.no_cases_title',
      no_cases_description: 'case.empty_state.no_cases_description',
      back_to_case_list: 'case.empty_state.back_to_case_list',
    },
  },
  news: {
    title: 'news.news.title',
    popular_articles: 'news.news.popular_articles',
    empty_state: {
      no_news_title: 'news.empty_state.no_news_title',
      no_news_description: 'news.empty_state.no_news_description',
      back_to_news_list: 'news.empty_state.back_to_news_list',
    },
  },
  contact: {
    page_title: 'contact.page_title',
    subtitle: '',
    form: {
      title: 'contact.form.title',
      description: 'contact.form.description',
    },
  },
  search: {
    title: 'search.title',
    description: 'search.description',
    placeholder: 'search.placeholder',
    noResults: 'search.noResults',
    noResultsDescription: 'search.noResultsDescription',
  },
  product: {
    title: 'product.product.title',
    advantages: 'product.product.advantages',
    contact_us: 'product.product.contact_us',
    share_to: 'product.product.share_to',
    details: 'product.product.details',
    description: 'product.product.description',
    related: {
      products: 'product.related.products',
      news: 'product.related.news',
      recommended: 'product.related.recommended',
      view_more: 'product.related.view_more',
      contact_now: 'product.related.contact_now',
      get_quote: 'product.related.get_quote',
    },
    button: {
      contactNow: 'product.button.contactNow',
      email: 'product.button.email',
      telephone: 'product.button.telephone',
      whatsapp: 'product.button.whatsapp',
    },
    empty_state: {
      no_products_title: 'product.empty_state.no_products_title',
      no_products_description: 'product.empty_state.no_products_description',
      back_to_products_list: 'product.empty_state.back_to_product_list',
    },
  },
  navigation: {
    previous_product: 'product.navigation.previous_product',
    next_product: 'product.navigation.next_product',
    previous_article: 'news.navigation.previous_article',
    next_article: 'news.navigation.next_article',
  },
  form: {
    title: 'contact.form.title',
    description: 'contact.form.description',
    send: 'form.buttons.submit',
    validation: {
      email_invalid: 'form.validation.email_invalid',
      phone_invalid: 'form.validation.phone_invalid',
      whatsapp_invalid: 'form.validation.whatsapp_invalid',
      invalid_format: 'form.validation.invalid_format'
    },
    messages: {
      sending: 'form.messages.sending',
      submit_success_toast_text: 'form.messages.submit_success_toast_text',
      submit_success_toast_subtitle: 'form.messages.submit_success_toast_subtitle',
      submit_success_toast_button: 'form.messages.submit_success_toast_button',
      submit_success_model_text: 'form.messages.submit_success_model_text',
      submit_success_model_subtitle: 'form.messages.submit_success_model_subtitle',
      submit_success_model_button: 'form.messages.submit_success_model_button'
    }
  },
  related: {
    products: 'product.related.products',
    news: 'news.related.news',
  },
};

// 递归创建翻译对象的辅助函数
function createNestedTranslationObject(lang: string, translationData: Record<string, Record<string, any>>, config: any): any {
  const t = createTranslator(lang, translationData);
  
  if (typeof config === 'string') {
    // 支持多级路径，如 'contact.form.title'
    const parts = config.split('.');
    const namespace = parts[0];
    const translationKey = parts.slice(1).join('.');
    return t(namespace, translationKey);
  }
  
  if (typeof config === 'object' && config !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(config)) {
      result[key] = createNestedTranslationObject(lang, translationData, value);
    }
    return result;
  }
  return config;
}

// 异步版本的 getDictionary（用于未来使用）
export async function getDictionary(lang: string): Promise<any> {
  const translationData = await getTranslationData();
  return createNestedTranslationObject(lang, translationData, TRANSLATION_CONFIG);
}