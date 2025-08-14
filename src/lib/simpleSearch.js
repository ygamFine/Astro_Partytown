// 简单的搜索功能 - 用于开发环境
export async function simpleSearch(query, lang = 'en') {
  try {
    // 模拟搜索结果
    const mockResults = [
      {
        url: `/${lang}/products/1`,
        meta: {
          title: '产品1 - 滑移装载机',
          excerpt: '高性能滑移装载机，适用于各种工程作业',
          category: 'product'
        }
      },
      {
        url: `/${lang}/products/2`,
        meta: {
          title: '产品2 - 反铲装载机',
          excerpt: '多功能反铲装载机，挖掘装载一体化',
          category: 'product'
        }
      },
      {
        url: `/${lang}/news/25`,
        meta: {
          title: '公司新闻 - 新产品发布',
          excerpt: '我们很高兴地宣布推出新一代工程机械产品',
          category: 'news'
        }
      },
      {
        url: `/${lang}/case/6`,
        meta: {
          title: '成功案例 - 建筑项目',
          excerpt: '在某大型建筑项目中成功应用我们的设备',
          category: 'case'
        }
      }
    ];

    // 简单的关键词匹配
    const filteredResults = mockResults.filter(result => {
      const searchText = `${result.meta.title} ${result.meta.excerpt}`.toLowerCase();
      const queryLower = query.toLowerCase();
      return searchText.includes(queryLower);
    });

    return {
      results: filteredResults
    };
  } catch (error) {
    console.error('简单搜索失败:', error);
    return { results: [] };
  }
}
