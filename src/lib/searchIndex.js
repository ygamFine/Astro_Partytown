// SSG 兼容的搜索索引生成器
import { getEnabledLanguages } from './i18n-config.js';
import { getProducts } from './strapi.js';
import { getNews } from './strapi.js';
import { getCases } from './strapi.js';

// 生成搜索索引数据（在构建时执行）
export async function generateSearchIndex() {
  const searchData = {
    products: [],
    news: [],
    cases: []
  };

  try {
    // 获取所有启用的语言的产品数据
    const enabledLanguages = getEnabledLanguages();
    for (const lang of enabledLanguages) {
      const products = await getProducts(lang);
      if (products && products.length > 0) {
        // 处理产品数据
        products.forEach(product => {
          // 确保所有字段都有有效值
          const safeSlug = product.slug || `product-${product.id}`;
          const safeTitle = product.name || product.Title || product.title || `产品 ${product.id}`;
          const safeExcerpt = product.excerpt || product.description || '';
          const safeCategory = product.category || '产品';
          const safeImage = Array.isArray(product.image) 
            ? (product.image[0] || '/images/placeholder.webp')
            : (product.image || '/images/placeholder.webp');
          
          const searchItem = {
            id: product.id,
            type: 'product',
            slug: safeSlug,
            title: safeTitle,
            excerpt: safeExcerpt,
            content: generateProductContent(product),
            category: safeCategory,
            image: safeImage,
            price: product.price || '',
            url: `/${lang}/products/${safeSlug}`,
            lang: lang,
            searchText: generateSearchText(product)
          };
          searchData.products.push(searchItem);
        });
      }
    }

    // 获取所有启用的语言的新闻数据
    for (const lang of enabledLanguages) {
      const news = await getNews(lang);
      if (news && news.length > 0) {
        // 处理新闻数据
        news.forEach(item => {
          // 确保所有字段都有有效值
          const safeSlug = item.slug || `news-${item.id}`;
          const safeTitle = item.title || `新闻 ${item.id}`;
          const safeExcerpt = item.excerpt || item.description || '';
          const safeImage = Array.isArray(item.image) 
            ? (item.image[0] || '/images/placeholder.webp')
            : (item.image || '/images/placeholder.webp');
          
          const searchItem = {
            id: item.id,
            type: 'news',
            slug: safeSlug,
            title: safeTitle,
            excerpt: safeExcerpt,
            content: item.content || '',
            image: safeImage,
            date: item.date || item.publishedAt || '',
            author: item.author || '',
            url: `/${lang}/news/${safeSlug}`,
            lang: lang,
            searchText: generateNewsSearchText(item)
          };
          searchData.news.push(searchItem);
        });
      }
    }

    // 获取所有启用的语言的案例数据
    for (const lang of enabledLanguages) {
      const cases = await getCases(lang);
      if (cases && cases.length > 0) {
        // 处理案例数据
        cases.forEach(caseItem => {
          // 确保所有字段都有有效值
          const safeSlug = caseItem.slug || `case-${caseItem.id}`;
          const safeTitle = caseItem.title || `案例 ${caseItem.id}`;
          const safeExcerpt = caseItem.excerpt || caseItem.description || '';
          const safeCategory = caseItem.category || '案例';
          const safeImage = Array.isArray(caseItem.image) 
            ? (caseItem.image[0] || '/images/placeholder.webp')
            : (caseItem.image || '/images/placeholder.webp');
          
          const searchItem = {
            id: caseItem.id,
            type: 'case',
            slug: safeSlug,
            title: safeTitle,
            excerpt: safeExcerpt,
            content: caseItem.content || '',
            category: safeCategory,
            image: safeImage,
            client: caseItem.client || '',
            industry: caseItem.industry || '',
            location: caseItem.location || '',
            url: `/${lang}/case/${caseItem.id}`,
            lang: lang,
            searchText: generateCaseSearchText(caseItem)
          };
          searchData.cases.push(searchItem);
        });
      }
    }

    return searchData;
    
  } catch (error) {
    console.error('生成 SSG 搜索索引失败:', error);
    return searchData;
  }
}

// 生成产品内容
function generateProductContent(product) {
  const specs = product.specs?.map(spec => `${spec.key || ''} ${spec.value || ''}`).join(' ') || '';
  const features = product.features?.join(' ') || '';
  const description = product.description || product.excerpt || '';
  const title = product.name || product.Title || '';
  return `${title} ${description} ${specs} ${features}`.trim();
}

// 生成产品搜索文本
function generateSearchText(product) {
  const specs = product.specs?.map(spec => `${spec.key || ''} ${spec.value || ''}`).join(' ') || '';
  const features = product.features?.join(' ') || '';
  const description = product.description || product.excerpt || '';
  const category = product.category || '产品';
  const title = product.name || product.Title || '';
  return `${title} ${description} ${specs} ${features} ${category}`.toLowerCase().trim();
}

// 生成新闻搜索文本
function generateNewsSearchText(news) {
  const content = news.content || '';
  const excerpt = news.excerpt || news.description || '';
  const author = news.author || '';
  return `${news.title || ''} ${excerpt} ${content} ${author}`.toLowerCase().trim();
}

// 生成案例搜索文本
function generateCaseSearchText(caseItem) {
  const content = caseItem.content || '';
  const excerpt = caseItem.excerpt || caseItem.description || '';
  const client = caseItem.client || '';
  const industry = caseItem.industry || '';
  const location = caseItem.location || '';
  const category = caseItem.category || '案例';
  return `${caseItem.title || ''} ${excerpt} ${content} ${client} ${industry} ${location} ${category}`.toLowerCase().trim();
}

// 客户端搜索函数（使用预生成的索引）
export async function performSearch(query, lang = 'en', type = 'all') {
  try {
    // 从预生成的 JSON 文件加载搜索索引
    const searchData = await loadSearchIndex();
    
    const allItems = [
      ...searchData.products,
      ...searchData.news,
      ...searchData.cases
    ];

    // 过滤语言
    const langItems = allItems.filter(item => item.lang === lang);
    
    // 过滤类型
    let filteredItems = langItems;
    if (type !== 'all') {
      filteredItems = langItems.filter(item => item.type === type);
    }

    // 执行搜索
    const results = filteredItems.filter(item => {
      const searchText = item.searchText || '';
      const queryLower = query.toLowerCase();
      
      // 检查标题、内容、分类等字段
      return searchText.includes(queryLower) ||
             (item.title && item.title.toLowerCase().includes(queryLower)) ||
             (item.excerpt && item.excerpt.toLowerCase().includes(queryLower)) ||
             (item.category && item.category.toLowerCase().includes(queryLower));
    });

    // 按相关性排序
    results.sort((a, b) => {
      const aScore = calculateRelevanceScore(a, query);
      const bScore = calculateRelevanceScore(b, query);
      return bScore - aScore;
    });

    return results;
    
  } catch (error) {
    console.error('客户端搜索失败:', error);
    return [];
  }
}

// 加载预生成的搜索索引
async function loadSearchIndex() {
  try {
    // 从公共目录加载预生成的搜索索引
    const response = await fetch('/search-index.json');
    if (!response.ok) {
      throw new Error('Failed to load search index');
    }
    return await response.json();
  } catch (error) {
    console.error('加载搜索索引失败:', error);
    return { products: [], news: [], cases: [] };
  }
}

// 计算相关性分数
function calculateRelevanceScore(item, query) {
  const queryLower = query.toLowerCase();
  let score = 0;
  
  // 标题匹配权重最高
  if (item.title && item.title.toLowerCase().includes(queryLower)) {
    score += 10;
  }
  
  // 分类匹配权重较高
  if (item.category && item.category.toLowerCase().includes(queryLower)) {
    score += 5;
  }
  
  // 内容匹配权重中等
  if (item.searchText && item.searchText.includes(queryLower)) {
    score += 3;
  }
  
  // 摘要匹配权重较低
  if (item.excerpt && item.excerpt.toLowerCase().includes(queryLower)) {
    score += 2;
  }
  
  return score;
}

// 获取搜索建议
export async function getSearchSuggestions(query, lang = 'en') {
  try {
    const searchData = await loadSearchIndex();
    const allItems = [
      ...searchData.products,
      ...searchData.news,
      ...searchData.cases
    ];

    const langItems = allItems.filter(item => item.lang === lang);
    const suggestions = new Set();

    langItems.forEach(item => {
      if (item.title && item.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(item.title);
      }
      if (item.category && item.category.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(item.category);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    return [];
  }
} 