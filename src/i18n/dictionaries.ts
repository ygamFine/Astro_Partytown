// 动态导入翻译文件
import { readdirSync } from 'fs';
import { join } from 'path';

// 支持的语言列表
const SUPPORTED_LANGUAGES = [
  'en', 'zh-CN', 'zh-Hant', 'fr', 'de', 'it', 'tr', 'es', 'pt-pt', 'nl', 
  'pl', 'ar', 'ru', 'th', 'id', 'vi', 'ms', 'ml', 'my', 'hi', 'ja', 'ko'
];

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
    // 如果文件不存在，返回空对象
    console.warn(`Translation file not found: ${lang}/${namespace}.json`);
    return {};
  }
}

// 动态生成翻译数据映射
async function generateTranslationData() {
  const translationData: Record<string, Record<string, any>> = {};
  
  for (const lang of SUPPORTED_LANGUAGES) {
    translationData[lang] = {};
    
    for (const namespace of TRANSLATION_NAMESPACES) {
      try {
        translationData[lang][namespace] = await loadTranslationFile(lang, namespace);
      } catch (error) {
        console.warn(`Failed to load translation for ${lang}/${namespace}:`, error);
        translationData[lang][namespace] = {};
      }
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
    if (!translations) {
      return key; // 如果没有该语言的翻译，直接返回key
    }
    
    const keys = key.split('.');
    let result = translations;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // 如果找不到翻译，返回key
      }
    }
    
    return result || key;
  } catch {
    return key;
  }
}

// 同步版本的 getDictionary（保持兼容性）
export default function getDictionary(lang: string): any {
  // 这是一个简化的同步版本，主要用于构建时
  // 在实际使用中，建议使用异步版本
  return {
    common: {
      placeholders: { search: 'Search' },
      pagination: {
        previous: 'Previous',
        next: 'Next',
        first: 'First',
        last: 'Last',
        page: 'Page',
        of: 'of',
        showing: 'Showing',
        to: 'to',
        entries: 'entries',
        per_page: 'per page',
        pages: 'pages',
        ofTotal: 'of'
      },
      actions: {
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        create: 'Create',
        add: 'Add',
        remove: 'Remove',
        copy: 'Copy',
        paste: 'Paste',
        cut: 'Cut',
        select: 'Select',
        deselect: 'Deselect',
        refresh: 'Refresh',
        reload: 'Reload',
        export: 'Export',
        import: 'Import',
        print: 'Print',
        share: 'Share',
        bookmark: 'Bookmark',
        like: 'Like',
        dislike: 'Dislike',
        grid_view: 'Grid View',
        list_view: 'List View'
      },
      units: {
        piece: 'piece',
        pieces: 'pieces',
        unit: 'unit',
        units: 'units',
        kg: 'kg',
        ton: 'ton',
        meter: 'm',
        kilometer: 'km',
        hour: 'hour',
        day: 'day',
        week: 'week',
        month: 'month',
        year: 'year',
        percent: '%',
        currency: '$'
      },
      product_card: {
        get_quote: 'Get Quote',
        contact_now: 'Contact Now',
        download_pdf: 'Download PDF',
        add_to_cart: 'Add to Cart'
      }
    },
    nav: { home: 'Home' },
    placeholder: { search: 'Search' },
    about: { title: 'About' },
    case: { 
      title: 'Cases',
      previous: 'Previous Case',
      next: 'Next Case'
    },
    news: { title: 'News' },
    contact: {
      page_title: 'Contact',
      subtitle: '',
      form: {
        title: 'Contact Form',
        description: 'Get in touch with us'
      }
    },
    search: {
      title: 'Search',
      description: 'Search our content',
      placeholder: 'Search...',
      noResults: 'No results found',
      noResultsDescription: 'Try adjusting your search terms',
      searchError: 'Search error',
      searchErrorDescription: 'Something went wrong',
      retry: 'Retry',
      clearSearch: 'Clear Search',
      loadMore: 'Load More',
      results: 'Results',
      resultsFor: 'Results for',
      showingResults: 'Showing results',
      filters: 'Filters',
      filterBy: 'Filter by'
    },
    product: {
      advantages: 'Advantages',
      advantages_list: ['Advantage 1', 'Advantage 2', 'Advantage 3'], // 返回数组而不是字符串
      contact_us: 'Contact Us',
      share_to: 'Share to',
      details: 'Details',
      description: 'Description',
      specifications: 'Specifications',
      features: 'Features',
      applications: 'Applications',
      applications_text: 'Applications Text',
      related: {
        products: 'Related Products',
        news: 'Related News',
        recommended: 'Recommended',
        view_more: 'View More',
        contact_now: 'Contact Now',
        get_quote: 'Get Quote'
      },
      button: {
        contactNow: 'Contact Now',
        email: 'Email',
        telephone: 'Telephone',
        whatsapp: 'WhatsApp'
      }
    },
    navigation: {
      previous_product: 'Previous Product',
      next_product: 'Next Product',
      previous_article: 'Previous Article',
      next_article: 'Next Article'
    },
    form: {
      title: 'Contact Form',
      name: 'Name',
      name_placeholder: 'Enter your name',
      telephone: 'Telephone',
      telephone_placeholder: 'Enter your phone number',
      email: 'Email',
      email_placeholder: 'Enter your email',
      message: 'Message',
      message_placeholder: 'Enter your message',
      captcha: 'Captcha',
      send: 'Send'
    },
    related: {
      products: 'Related Products',
      news: 'Related News'
    }
  };
}

// 异步版本的 getDictionary（用于未来使用）
export async function getDictionaryAsync(lang: string): Promise<any> {
  const translationData = await getTranslationData();
  
  return {
    // 通用翻译
    common: {
      placeholders: {
        search: getTranslation(lang, 'common', 'placeholders.search', translationData),
      },
      pagination: {
        previous: getTranslation(lang, 'common', 'pagination.previous', translationData),
        next: getTranslation(lang, 'common', 'pagination.next', translationData),
        first: getTranslation(lang, 'common', 'pagination.first', translationData),
        last: getTranslation(lang, 'common', 'pagination.last', translationData),
        page: getTranslation(lang, 'common', 'pagination.page', translationData),
        of: getTranslation(lang, 'common', 'pagination.of', translationData),
        showing: getTranslation(lang, 'common', 'pagination.showing', translationData),
        to: getTranslation(lang, 'common', 'pagination.to', translationData),
        entries: getTranslation(lang, 'common', 'pagination.entries', translationData),
        per_page: getTranslation(lang, 'common', 'pagination.per_page', translationData),
        pages: getTranslation(lang, 'common', 'pagination.pages', translationData),
        ofTotal: getTranslation(lang, 'common', 'pagination.ofTotal', translationData),
      },
      actions: {
        view: getTranslation(lang, 'common', 'actions.view', translationData),
        edit: getTranslation(lang, 'common', 'actions.edit', translationData),
        delete: getTranslation(lang, 'common', 'actions.delete', translationData),
        create: getTranslation(lang, 'common', 'actions.create', translationData),
        add: getTranslation(lang, 'common', 'actions.add', translationData),
        remove: getTranslation(lang, 'common', 'actions.remove', translationData),
        copy: getTranslation(lang, 'common', 'actions.copy', translationData),
        paste: getTranslation(lang, 'common', 'actions.paste', translationData),
        cut: getTranslation(lang, 'common', 'actions.cut', translationData),
        select: getTranslation(lang, 'common', 'actions.select', translationData),
        deselect: getTranslation(lang, 'common', 'actions.deselect', translationData),
        refresh: getTranslation(lang, 'common', 'actions.refresh', translationData),
        reload: getTranslation(lang, 'common', 'actions.reload', translationData),
        export: getTranslation(lang, 'common', 'actions.export', translationData),
        import: getTranslation(lang, 'common', 'actions.import', translationData),
        print: getTranslation(lang, 'common', 'actions.print', translationData),
        share: getTranslation(lang, 'common', 'actions.share', translationData),
        bookmark: getTranslation(lang, 'common', 'actions.bookmark', translationData),
        like: getTranslation(lang, 'common', 'actions.like', translationData),
        dislike: getTranslation(lang, 'common', 'actions.dislike', translationData),
        grid_view: getTranslation(lang, 'common', 'actions.grid_view', translationData),
        list_view: getTranslation(lang, 'common', 'actions.list_view', translationData),
      },
      units: {
        piece: getTranslation(lang, 'common', 'units.piece', translationData),
        pieces: getTranslation(lang, 'common', 'units.pieces', translationData),
        unit: getTranslation(lang, 'common', 'units.unit', translationData),
        units: getTranslation(lang, 'common', 'units.units', translationData),
        kg: getTranslation(lang, 'common', 'units.kg', translationData),
        ton: getTranslation(lang, 'common', 'units.ton', translationData),
        meter: getTranslation(lang, 'common', 'units.meter', translationData),
        kilometer: getTranslation(lang, 'common', 'units.kilometer', translationData),
        hour: getTranslation(lang, 'common', 'units.hour', translationData),
        day: getTranslation(lang, 'common', 'units.day', translationData),
        week: getTranslation(lang, 'common', 'units.week', translationData),
        month: getTranslation(lang, 'common', 'units.month', translationData),
        year: getTranslation(lang, 'common', 'units.year', translationData),
        percent: getTranslation(lang, 'common', 'units.percent', translationData),
        currency: getTranslation(lang, 'common', 'units.currency', translationData),
      },
      product_card: {
        get_quote: getTranslation(lang, 'common', 'product_card.get_quote', translationData),
        contact_now: getTranslation(lang, 'common', 'product_card.contact_now', translationData),
        download_pdf: getTranslation(lang, 'common', 'product_card.download_pdf', translationData),
        add_to_cart: getTranslation(lang, 'common', 'product_card.add_to_cart', translationData),
      },
    },
    
    // 导航
    nav: {
      home: getTranslation(lang, 'breadcrumb', 'home', translationData),
    },
    
    // 占位符
    placeholder: {
      search: getTranslation(lang, 'common', 'placeholders.search', translationData),
    },
    
    // 关于页面
    about: {
      title: getTranslation(lang, 'about', 'page_title', translationData),
    },
    
    // 案例页面
    case: {
      title: getTranslation(lang, 'case', 'case.title', translationData),
      previous: getTranslation(lang, 'case', 'navigation.previous_case', translationData),
      next: getTranslation(lang, 'case', 'navigation.next_case', translationData),
    },
    
    // 新闻页面
    news: {
      title: getTranslation(lang, 'news', 'news.title', translationData),
    },
    
    // 联系页面
    contact: {
      page_title: getTranslation(lang, 'contact', 'page_title', translationData),
      subtitle: '',
      form: {
        title: getTranslation(lang, 'contact', 'form.title', translationData),
        description: getTranslation(lang, 'contact', 'form.description', translationData),
      },
    },
    
    // 搜索页面
    search: {
      title: getTranslation(lang, 'search', 'title', translationData),
      description: getTranslation(lang, 'search', 'description', translationData),
      placeholder: getTranslation(lang, 'search', 'placeholder', translationData),
      noResults: getTranslation(lang, 'search', 'noResults', translationData),
      noResultsDescription: getTranslation(lang, 'search', 'noResultsDescription', translationData),
      searchError: getTranslation(lang, 'search', 'searchError', translationData),
      searchErrorDescription: getTranslation(lang, 'search', 'searchErrorDescription', translationData),
      retry: getTranslation(lang, 'search', 'retry', translationData),
      clearSearch: getTranslation(lang, 'search', 'clearSearch', translationData),
      loadMore: getTranslation(lang, 'search', 'loadMore', translationData),
      results: getTranslation(lang, 'search', 'results', translationData),
      resultsFor: getTranslation(lang, 'search', 'resultsFor', translationData),
      showingResults: getTranslation(lang, 'search', 'showingResults', translationData),
      filters: getTranslation(lang, 'search', 'filters', translationData),
      filterBy: getTranslation(lang, 'search', 'filterBy', translationData)
    },
    
    // 产品页面
    product: {
      advantages: getTranslation(lang, 'product', 'product.advantages', translationData),
      advantages_list: getTranslation(lang, 'product', 'product.advantages_list', translationData),
      contact_us: getTranslation(lang, 'product', 'product.contact_us', translationData),
      share_to: getTranslation(lang, 'product', 'product.share_to', translationData),
      details: getTranslation(lang, 'product', 'product.details', translationData),
      description: getTranslation(lang, 'product', 'product.description', translationData),
      specifications: getTranslation(lang, 'product', 'product.specifications', translationData),
      features: getTranslation(lang, 'product', 'product.features', translationData),
      applications: getTranslation(lang, 'product', 'product.applications', translationData),
      applications_text: getTranslation(lang, 'product', 'product.applications_text', translationData),
      related: {
        products: getTranslation(lang, 'product', 'related.products', translationData),
        news: getTranslation(lang, 'product', 'related.news', translationData),
        recommended: getTranslation(lang, 'product', 'related.recommended', translationData),
        view_more: getTranslation(lang, 'product', 'related.view_more', translationData),
        contact_now: getTranslation(lang, 'product', 'related.contact_now', translationData),
        get_quote: getTranslation(lang, 'product', 'related.get_quote', translationData),
      },
      button: {
        contactNow: getTranslation(lang, 'product', 'button.contactNow', translationData),
        email: getTranslation(lang, 'product', 'button.email', translationData),
        telephone: getTranslation(lang, 'product', 'button.telephone', translationData),
        whatsapp: getTranslation(lang, 'product', 'button.whatsapp', translationData),
      },
    },
    
    // 导航
    navigation: {
      previous_product: getTranslation(lang, 'product', 'navigation.previous_product', translationData),
      next_product: getTranslation(lang, 'product', 'navigation.next_product', translationData),
      previous_article: getTranslation(lang, 'news', 'navigation.previous_article', translationData),
      next_article: getTranslation(lang, 'news', 'navigation.next_article', translationData),
    },
    
    // 表单
    form: {
      title: getTranslation(lang, 'product', 'form.title', translationData),
      name: getTranslation(lang, 'product', 'form.name', translationData),
      name_placeholder: getTranslation(lang, 'product', 'form.name_placeholder', translationData),
      telephone: getTranslation(lang, 'product', 'form.telephone', translationData),
      telephone_placeholder: getTranslation(lang, 'product', 'form.telephone_placeholder', translationData),
      email: getTranslation(lang, 'product', 'form.email', translationData),
      email_placeholder: getTranslation(lang, 'product', 'form.email_placeholder', translationData),
      message: getTranslation(lang, 'product', 'form.message', translationData),
      message_placeholder: getTranslation(lang, 'product', 'form.message_placeholder', translationData),
      captcha: getTranslation(lang, 'product', 'form.captcha', translationData),
      send: getTranslation(lang, 'product', 'form.send', translationData),
    },
    
    // 相关
    related: {
      products: getTranslation(lang, 'product', 'related.products', translationData),
      news: getTranslation(lang, 'news', 'related.news', translationData),
    },
  };
} 