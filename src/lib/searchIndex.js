// 搜索索引生成器
import { products } from '../data/products.js';
import { allNews } from '../data/news.js';
import { allCases } from '../data/cases.js';
import { SUPPORTED_LANGUAGES } from '../locales/i18n.js';

// 生成搜索索引数据
export function generateSearchIndex() {
  const searchData = {
    products: [],
    news: [],
    cases: []
  };

  // 处理产品数据
  products.forEach(product => {
    // 为每种语言生成搜索数据
    SUPPORTED_LANGUAGES.forEach(lang => {
      const searchItem = {
        id: product.id,
        type: 'product',
        slug: product.slug,
        title: product.name,
        excerpt: product.excerpt,
        content: generateProductContent(product),
        category: product.category,
        image: product.image,
        price: product.price,
        url: `/${lang}/products/${product.slug}`,
        lang: lang,
        searchText: generateSearchText(product)
      };
      searchData.products.push(searchItem);
    });
  });

  // 处理新闻数据
  allNews.forEach(news => {
    SUPPORTED_LANGUAGES.forEach(lang => {
      const searchItem = {
        id: news.id,
        type: 'news',
        slug: news.slug,
        title: news.title,
        excerpt: news.excerpt,
        content: news.content,
        category: news.category,
        image: news.image,
        date: news.date,
        url: `/${lang}/news/${news.slug}`,
        lang: lang,
        searchText: generateNewsSearchText(news)
      };
      searchData.news.push(searchItem);
    });
  });

  // 处理案例数据
  allCases.forEach(caseItem => {
    SUPPORTED_LANGUAGES.forEach(lang => {
      const searchItem = {
        id: caseItem.id,
        type: 'case',
        slug: caseItem.slug,
        title: caseItem.title,
        excerpt: caseItem.excerpt,
        content: caseItem.content,
        category: caseItem.category,
        image: caseItem.image,
        client: caseItem.client,
        date: caseItem.date,
        url: `/${lang}/case/${caseItem.slug}`,
        lang: lang,
        searchText: generateCaseSearchText(caseItem)
      };
      searchData.cases.push(searchItem);
    });
  });

  return searchData;
}

// 生成产品搜索文本
function generateProductContent(product) {
  const specs = product.specs?.map(spec => `${spec.key}: ${spec.value}`).join(' ') || '';
  const features = product.features?.join(' ') || '';
  return `${product.name} ${product.excerpt} ${specs} ${features}`;
}

// 生成产品搜索文本
function generateSearchText(product) {
  const specs = product.specs?.map(spec => `${spec.key} ${spec.value}`).join(' ') || '';
  const features = product.features?.join(' ') || '';
  return `${product.name} ${product.excerpt} ${specs} ${features} ${product.category}`.toLowerCase();
}

// 生成新闻搜索文本
function generateNewsSearchText(news) {
  // 移除HTML标签，提取纯文本
  const contentText = news.content.replace(/<[^>]*>/g, ' ');
  return `${news.title} ${news.excerpt} ${contentText} ${news.category}`.toLowerCase();
}

// 生成案例搜索文本
function generateCaseSearchText(caseItem) {
  const contentText = caseItem.content.replace(/<[^>]*>/g, ' ');
  const results = caseItem.results?.join(' ') || '';
  return `${caseItem.title} ${caseItem.excerpt} ${contentText} ${caseItem.category} ${caseItem.client} ${results}`.toLowerCase();
}

// 搜索函数
export function performSearch(query, lang = 'en', type = 'all') {
  const searchData = generateSearchIndex();
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

  if (!query || query.trim() === '') {
    return [];
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  // 计算相关性分数
  const scoredResults = filteredItems.map(item => {
    let score = 0;
    const searchText = item.searchText;
    
    searchTerms.forEach(term => {
      // 标题匹配权重最高
      if (item.title.toLowerCase().includes(term)) {
        score += 10;
      }
      // 分类匹配
      if (item.category.toLowerCase().includes(term)) {
        score += 5;
      }
      // 内容匹配
      if (searchText.includes(term)) {
        score += 1;
      }
      // 精确匹配加分
      if (item.title.toLowerCase() === term) {
        score += 20;
      }
    });

    return { ...item, score };
  });

  // 按分数排序并过滤
  return scoredResults
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // 限制结果数量
}

// 获取搜索建议
export function getSearchSuggestions(query, lang = 'en') {
  const searchData = generateSearchIndex();
  const allItems = [
    ...searchData.products,
    ...searchData.news,
    ...searchData.cases
  ].filter(item => item.lang === lang);

  if (!query || query.trim() === '') {
    return [];
  }

  const suggestions = new Set();
  const queryLower = query.toLowerCase();

  allItems.forEach(item => {
    // 标题建议
    if (item.title.toLowerCase().includes(queryLower)) {
      suggestions.add(item.title);
    }
    // 分类建议
    if (item.category.toLowerCase().includes(queryLower)) {
      suggestions.add(item.category);
    }
  });

  return Array.from(suggestions).slice(0, 5);
} 