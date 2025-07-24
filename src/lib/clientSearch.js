/**
 * 客户端搜索模块 - 仅用于浏览器环境
 * 不包含任何 Node.js 特定的代码
 */

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

// 获取搜索统计信息
export async function getSearchStats() {
  try {
    const searchData = await loadSearchIndex();
    return {
      totalProducts: searchData.products.length,
      totalNews: searchData.news.length,
      totalCases: searchData.cases.length,
      totalItems: searchData.products.length + searchData.news.length + searchData.cases.length
    };
  } catch (error) {
    console.error('获取搜索统计失败:', error);
    return {
      totalProducts: 0,
      totalNews: 0,
      totalCases: 0,
      totalItems: 0
    };
  }
} 