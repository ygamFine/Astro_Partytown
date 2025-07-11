import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 支持的语言列表
const SUPPORTED_LANGS = ['en', 'zh-hans', 'zh-hant', 'fr', 'de', 'es', 'it', 'pt-pt', 'ru', 'ar', 'ja', 'ko', 'vi', 'id', 'th', 'tr', 'hi', 'ml', 'ms', 'my', 'nl', 'pl'];

// 新闻模块的翻译内容
const newsTranslations = {
  'en': {
    "breadcrumb": {
      "home": "Home",
      "news": "News"
    },
    "news": {
      "title": "News Center",
      "description": "Stay updated with our latest news and industry insights",
      "read_more": "Read More",
      "published_date": "Published Date",
      "author": "Author",
      "category": "Category",
      "tags": "Tags",
      "share_article": "Share Article",
      "related_articles": "Related Articles",
      "popular_articles": "Popular Articles",
      "latest_news": "Latest News",
      "industry_insights": "Industry Insights",
      "company_updates": "Company Updates",
      "product_news": "Product News"
    },
    "navigation": {
      "previous_article": "Previous Article",
      "next_article": "Next Article",
      "back_to_news": "Back to News"
    },
    "pagination": {
      "showing": "Showing",
      "to": "to",
      "of": "of",
      "articles": "articles",
      "pages": "pages"
    },
    "related": {
      "products": "Related Products",
      "news": "Related News"
    },
    "sidebar": {
      "popular_articles": "Popular Articles",
      "categories": "Categories",
      "latest_news": "Latest News"
    }
  },
  'zh-hans': {
    "breadcrumb": {
      "home": "首页",
      "news": "新闻中心"
    },
    "news": {
      "title": "新闻中心",
      "description": "了解我们的最新新闻和行业洞察",
      "read_more": "阅读更多",
      "published_date": "发布日期",
      "author": "作者",
      "category": "分类",
      "tags": "标签",
      "share_article": "分享文章",
      "related_articles": "相关文章",
      "popular_articles": "热门文章",
      "latest_news": "最新新闻",
      "industry_insights": "行业洞察",
      "company_updates": "公司动态",
      "product_news": "产品新闻"
    },
    "navigation": {
      "previous_article": "上一篇文章",
      "next_article": "下一篇文章",
      "back_to_news": "返回新闻列表"
    },
    "pagination": {
      "showing": "显示",
      "to": "到",
      "of": "共",
      "articles": "篇文章",
      "pages": "页"
    },
    "related": {
      "products": "相关产品",
      "news": "相关新闻"
    },
    "sidebar": {
      "popular_articles": "热门文章",
      "categories": "分类",
      "latest_news": "最新新闻"
    }
  }
};

// 案例模块的翻译内容
const caseTranslations = {
  'en': {
    "breadcrumb": {
      "home": "Home",
      "cases": "Customer Cases"
    },
    "case": {
      "title": "Customer Cases",
      "description": "Discover how our machinery solutions have helped customers achieve success across various industries",
      "view_case": "View Case",
      "case_details": "Case Details",
      "customer_info": "Customer Information",
      "project_overview": "Project Overview",
      "challenges": "Challenges",
      "solutions": "Solutions",
      "results": "Results",
      "testimonials": "Customer Testimonials",
      "industry": "Industry",
      "location": "Location",
      "completion_date": "Completion Date",
      "equipment_used": "Equipment Used",
      "project_duration": "Project Duration"
    },
    "navigation": {
      "previous_case": "Previous Case",
      "next_case": "Next Case",
      "back_to_cases": "Back to Cases"
    },
    "pagination": {
      "showing": "Showing",
      "to": "to",
      "of": "of",
      "cases": "cases",
      "pages": "pages"
    },
    "related": {
      "cases": "Related Cases",
      "news": "Related News",
      "view_more": "View More"
    },
    "sidebar": {
      "related_cases": "Related Cases",
      "categories": "Categories",
      "latest_cases": "Latest Cases"
    }
  },
  'zh-hans': {
    "breadcrumb": {
      "home": "首页",
      "cases": "客户案例"
    },
    "case": {
      "title": "客户案例",
      "description": "了解我们的机械设备解决方案如何帮助客户在各个行业取得成功",
      "view_case": "查看案例",
      "case_details": "案例详情",
      "customer_info": "客户信息",
      "project_overview": "项目概述",
      "challenges": "挑战",
      "solutions": "解决方案",
      "results": "成果",
      "testimonials": "客户评价",
      "industry": "行业",
      "location": "地点",
      "completion_date": "完成日期",
      "equipment_used": "使用设备",
      "project_duration": "项目周期"
    },
    "navigation": {
      "previous_case": "上一个案例",
      "next_case": "下一个案例",
      "back_to_cases": "返回案例列表"
    },
    "pagination": {
      "showing": "显示",
      "to": "到",
      "of": "共",
      "cases": "个案例",
      "pages": "页"
    },
    "related": {
      "cases": "相关案例",
      "news": "相关新闻",
      "view_more": "查看更多"
    },
    "sidebar": {
      "related_cases": "相关案例",
      "categories": "分类",
      "latest_cases": "最新案例"
    }
  }
};

// 为其他语言生成基础翻译（使用英文作为模板）
function generateTranslationsForLang(lang) {
  if (lang === 'en' || lang === 'zh-hans') {
    return; // 跳过已存在的语言
  }

  // 复制英文翻译作为基础
  newsTranslations[lang] = JSON.parse(JSON.stringify(newsTranslations['en']));
  caseTranslations[lang] = JSON.parse(JSON.stringify(caseTranslations['en']));
}

// 生成所有语言的翻译文件
function generateAllTranslations() {
  const localesDir = path.join(__dirname, '../src/locales');

  SUPPORTED_LANGS.forEach(lang => {
    generateTranslationsForLang(lang);
    
    const langDir = path.join(localesDir, lang);
    
    // 确保语言目录存在
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }

    // 生成新闻翻译文件
    const newsFile = path.join(langDir, 'news.json');
    fs.writeFileSync(newsFile, JSON.stringify(newsTranslations[lang], null, 2));
    console.log(`✅ Generated ${newsFile}`);

    // 生成案例翻译文件
    const caseFile = path.join(langDir, 'case.json');
    fs.writeFileSync(caseFile, JSON.stringify(caseTranslations[lang], null, 2));
    console.log(`✅ Generated ${caseFile}`);
  });

  console.log('\n🎉 All translation files generated successfully!');
  console.log(`📁 Generated ${SUPPORTED_LANGS.length * 2} files for ${SUPPORTED_LANGS.length} languages`);
}

// 运行脚本
generateAllTranslations(); 