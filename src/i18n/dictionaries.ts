// 导入所有翻译文件
import enCommon from './locales/en/common.json';
import enBreadcrumb from './locales/en/breadcrumb.json';
import enAbout from './locales/en/about.json';
import enCase from './locales/en/case.json';
import enNews from './locales/en/news.json';
import enContact from './locales/en/contact.json';
import enProduct from './locales/en/product.json';
import enForm from './locales/en/form.json';
import enSearch from './locales/en/search.json';
import zhCNCommon from './locales/zh-CN/common.json';
import zhCNBreadcrumb from './locales/zh-CN/breadcrumb.json';
import zhCNAbout from './locales/zh-CN/about.json';
import zhCNCase from './locales/zh-CN/case.json';
import zhCNNews from './locales/zh-CN/news.json';
import zhCNContact from './locales/zh-CN/contact.json';
import zhCNProduct from './locales/zh-CN/product.json';
import zhCNForm from './locales/zh-CN/form.json';
import zhCNSearch from './locales/zh-CN/search.json';

// 翻译数据映射
const translationData: Record<string, Record<string, any>> = {
  'en': {
    'common': enCommon,
    'breadcrumb': enBreadcrumb,
    'about': enAbout,
    'case': enCase,
    'news': enNews,
    'contact': enContact,
    'product': enProduct,
    'form': enForm,
    'search': enSearch
  },
  'zh-CN': {
    'common': zhCNCommon,
    'breadcrumb': zhCNBreadcrumb,
    'about': zhCNAbout,
    'case': zhCNCase,
    'news': zhCNNews,
    'contact': zhCNContact,
    'product': zhCNProduct,
    'form': zhCNForm,
    'search': zhCNSearch
  }
};

export default function getDictionary(lang: string): any {
  return {
    // 导航
    nav: {
      home: getTranslation(lang, 'breadcrumb', 'home'),
    },
    
    // 占位符
    placeholder: {
      search: getTranslation(lang, 'common', 'placeholders.search'),
    },
    
    // 分页
    pagination: {
      previous: getTranslation(lang, 'common', 'pagination.previous'),
      next: getTranslation(lang, 'common', 'pagination.next'),
      first: getTranslation(lang, 'common', 'pagination.first'),
      last: getTranslation(lang, 'common', 'pagination.last'),
      page: getTranslation(lang, 'common', 'pagination.page'),
      of: getTranslation(lang, 'common', 'pagination.of'),
      showing: getTranslation(lang, 'common', 'pagination.showing'),
      to: getTranslation(lang, 'common', 'pagination.to'),
      entries: getTranslation(lang, 'common', 'pagination.entries'),
      per_page: getTranslation(lang, 'common', 'pagination.per_page'),
      pages: getTranslation(lang, 'common', 'pagination.pages'),
      ofTotal: getTranslation(lang, 'common', 'pagination.ofTotal'),
    },
    
    // 关于页面
    about: {
      title: getTranslation(lang, 'about', 'page_title'),
    },
    
    // 案例页面
    case: {
      title: getTranslation(lang, 'case', 'case.title'),
      previous: getTranslation(lang, 'case', 'navigation.previous_case'),
      next: getTranslation(lang, 'case', 'navigation.next_case'),
    },
    
    // 新闻页面
    news: {
      title: getTranslation(lang, 'news', 'news.title'),
    },
    
    // 联系页面
    contact: {
      page_title: getTranslation(lang, 'contact', 'page_title'),
      subtitle: '',
      form: {
        title: getTranslation(lang, 'contact', 'form.title'),
        description: getTranslation(lang, 'contact', 'form.description'),
      },
    },
    
    // 搜索页面
    search: {
      title: getTranslation(lang, 'search', 'title'),
      description: getTranslation(lang, 'search', 'description'),
      placeholder: getTranslation(lang, 'search', 'placeholder'),
      noResults: getTranslation(lang, 'search', 'noResults'),
      noResultsDescription: getTranslation(lang, 'search', 'noResultsDescription'),
      searchError: getTranslation(lang, 'search', 'searchError'),
      searchErrorDescription: getTranslation(lang, 'search', 'searchErrorDescription'),
      retry: getTranslation(lang, 'search', 'retry'),
      clearSearch: getTranslation(lang, 'search', 'clearSearch'),
      loadMore: getTranslation(lang, 'search', 'loadMore'),
      results: getTranslation(lang, 'search', 'results'),
      resultsFor: getTranslation(lang, 'search', 'resultsFor'),
      showingResults: getTranslation(lang, 'search', 'showingResults'),
      filters: getTranslation(lang, 'search', 'filters'),
      filterBy: getTranslation(lang, 'search', 'filterBy')
    },
    
    // 产品页面
    product: {
      advantages: getTranslation(lang, 'product', 'product.advantages'),
      advantages_list: getTranslation(lang, 'product', 'product.advantages_list'),
      contact_us: getTranslation(lang, 'product', 'product.contact_us'),
      share_to: getTranslation(lang, 'product', 'product.share_to'),
      details: getTranslation(lang, 'product', 'product.details'),
      description: getTranslation(lang, 'product', 'product.description'),
      specifications: getTranslation(lang, 'product', 'product.specifications'),
      features: getTranslation(lang, 'product', 'product.features'),
      applications: getTranslation(lang, 'product', 'product.applications'),
      applications_text: getTranslation(lang, 'product', 'product.applications_text'),
      related: {
        products: getTranslation(lang, 'product', 'related.products'),
        news: getTranslation(lang, 'product', 'related.news'),
        recommended: getTranslation(lang, 'product', 'related.recommended'),
        view_more: getTranslation(lang, 'product', 'related.view_more'),
        contact_now: getTranslation(lang, 'product', 'related.contact_now'),
        get_quote: getTranslation(lang, 'product', 'related.get_quote'),
      },
      button: {
        contactNow: getTranslation(lang, 'product', 'button.contactNow'),
        email: getTranslation(lang, 'product', 'button.email'),
        telephone: getTranslation(lang, 'product', 'button.telephone'),
        whatsapp: getTranslation(lang, 'product', 'button.whatsapp'),
      },
    },
    
    // 导航
    navigation: {
      previous_product: getTranslation(lang, 'product', 'navigation.previous_product'),
      next_product: getTranslation(lang, 'product', 'navigation.next_product'),
      previous_article: getTranslation(lang, 'news', 'navigation.previous_article'),
      next_article: getTranslation(lang, 'news', 'navigation.next_article'),
    },
    
    // 表单
    form: {
      title: getTranslation(lang, 'product', 'form.title'),
      name: getTranslation(lang, 'product', 'form.name'),
      name_placeholder: getTranslation(lang, 'product', 'form.name_placeholder'),
      telephone: getTranslation(lang, 'product', 'form.telephone'),
      telephone_placeholder: getTranslation(lang, 'product', 'form.telephone_placeholder'),
      email: getTranslation(lang, 'product', 'form.email'),
      email_placeholder: getTranslation(lang, 'product', 'form.email_placeholder'),
      message: getTranslation(lang, 'product', 'form.message'),
      message_placeholder: getTranslation(lang, 'product', 'form.message_placeholder'),
      captcha: getTranslation(lang, 'product', 'form.captcha'),
      send: getTranslation(lang, 'product', 'form.send'),
    },
    
    // 相关
    related: {
      products: getTranslation(lang, 'product', 'related.products'),
      news: getTranslation(lang, 'news', 'related.news'),
    },
    

  };
}

// 翻译函数
function getTranslation(lang: string, namespace: string, key: string): string {
  try {
    const translations = translationData[lang]?.[namespace] || translationData['en']?.[namespace];
    const keys = key.split('.');
    let result = translations;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // 如果找不到翻译，回退到英文
        if (lang !== 'en') {
          const enTranslations = translationData['en']?.[namespace];
          let enResult = enTranslations;
          for (const enKey of keys) {
            if (enResult && typeof enResult === 'object' && enKey in enResult) {
              enResult = enResult[enKey];
            } else {
              return key;
            }
          }
          return enResult || key;
        }
        return key;
      }
    }
    
    return result || key;
  } catch {
    return key;
  }
} 