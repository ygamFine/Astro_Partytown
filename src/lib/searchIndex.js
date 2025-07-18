// SSG 兼容的搜索索引生成器
import { SUPPORTED_LANGUAGES } from '../locales/i18n.js';
import { getProducts } from './strapi.js';
import { getNews } from './strapi.js';

// 生成搜索索引数据（在构建时执行）
export async function generateSearchIndex() {
  const searchData = {
    products: [],
    news: [],
    cases: []
  };

  try {
    // 获取所有语言的产品数据
    for (const lang of SUPPORTED_LANGUAGES) {
      const products = await getProducts(lang);
      if (products && products.length > 0) {
        // 处理产品数据
        products.forEach(product => {
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
      }
    }

    // 获取所有语言的新闻数据
    for (const lang of SUPPORTED_LANGUAGES) {
      const news = await getNews(lang);
      if (news && news.length > 0) {
        // 处理新闻数据
        news.forEach(item => {
          const searchItem = {
            id: item.id,
            type: 'news',
            slug: item.slug,
            title: item.title,
            excerpt: item.excerpt,
            content: item.content,
            image: item.image,
            date: item.date,
            author: item.author,
            url: `/${lang}/news/${item.slug}`,
            lang: lang,
            searchText: generateNewsSearchText(item)
          };
          searchData.news.push(searchItem);
        });
      }
    }

    console.log('SSG 搜索索引生成完成:', {
      products: searchData.products.length,
      news: searchData.news.length,
      cases: searchData.cases.length
    });

    return searchData;
    
  } catch (error) {
    console.error('生成 SSG 搜索索引失败:', error);
    return searchData;
  }
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
  return `${news.title} ${news.excerpt} ${news.content}`.toLowerCase();
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