module.exports = {
  // 指定要索引的目录
  source: "dist",
  
  // 排除不需要搜索的文件
  exclude: [
    "**/404.html",
    "**/robots.txt",
    "**/sitemap.xml",
    "**/_astro/**",
    "**/assets/**"
  ],
  
  // 搜索配置
  search: {
    // 支持的语言
    languages: ["zh-CN", "en", "ja", "ru", "de", "ar"],
    
    // 搜索权重配置
    weights: {
      title: 10,
      excerpt: 5,
      content: 1
    }
  },
  
  // 索引配置
  index: {
    // 索引文件类型
    extensions: [".html"],
    
    // 自定义索引字段
    fields: [
      {
        name: "title",
        selector: "h1, h2, h3, .title, [data-pagefind-title]"
      },
      {
        name: "excerpt", 
        selector: ".excerpt, .description, [data-pagefind-excerpt]"
      },
      {
        name: "content",
        selector: "main, article, .content, [data-pagefind-content]"
      },
      {
        name: "category",
        selector: "[data-pagefind-category]"
      },
      {
        name: "date",
        selector: "[data-pagefind-date]"
      }
    ]
  }
};
