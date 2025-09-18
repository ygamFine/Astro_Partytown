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
    // 如果文件不存在，返回空对象
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
      try {
        translationData[lang][namespace] = await loadTranslationFile(lang, namespace);
      } catch (error) {
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

// 异步版本的 getDictionary（用于未来使用）
export async function getDictionary(lang: string): Promise<any> {
  const translationData = await getTranslationData();
  
  return {
    // 通用翻译
    common: {
      empty_state: {
        back_to_home: getTranslation(lang, 'common', 'empty_state.back_to_home', translationData),
      },
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
    empty_state: {
      back_to_home: getTranslation(lang, 'case', 'empty_state.back_to_home', translationData),
    },
    // 面包屑
    breadcrumb: {
      home: getTranslation(lang, 'breadcrumb', 'home', translationData),
      products: getTranslation(lang, 'breadcrumb', 'products', translationData),
      news: getTranslation(lang, 'breadcrumb', 'news', translationData),
      case: getTranslation(lang, 'breadcrumb', 'case', translationData),
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
      related: {
        cases: getTranslation(lang, 'case', 'related.cases', translationData),
        news: getTranslation(lang, 'case', 'related.news', translationData),
        view_more: getTranslation(lang, 'case', 'related.view_more', translationData),
      },
      empty_state: {
        no_cases_title: getTranslation(lang, 'case', 'empty_state.no_cases_title', translationData),
        no_cases_description: getTranslation(lang, 'case', 'empty_state.no_cases_description', translationData),
        back_to_case_list: getTranslation(lang, 'case', 'empty_state.back_to_case_list', translationData),
      },
    },
    
    // 新闻页面
    news: {
      title: getTranslation(lang, 'news', 'news.title', translationData),
      popular_articles: getTranslation(lang, 'news', 'news.popular_articles', translationData),
      empty_state: {
        no_news_title: getTranslation(lang, 'news', 'empty_state.no_news_title', translationData),
        no_news_description: getTranslation(lang, 'news', 'empty_state.no_news_description', translationData),
        back_to_news_list: getTranslation(lang, 'news', 'empty_state.back_to_news_list', translationData),
      },
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
      title: getTranslation(lang, 'product', 'product.title', translationData),
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
      empty_state: {
        no_products_title: getTranslation(lang, 'product', 'empty_state.no_products_title', translationData),
        no_products_description: getTranslation(lang, 'product', 'empty_state.no_products_description', translationData),
        back_to_products_list: getTranslation(lang, 'product', 'empty_state.back_to_product_list', translationData),
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