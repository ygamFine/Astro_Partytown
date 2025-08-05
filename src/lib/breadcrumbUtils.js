/**
 * 面包屑工具函数
 * 用于生成标准化的面包屑导航数据
 */

/**
 * 生成产品页面的面包屑
 */
export function generateProductBreadcrumbs(lang, productName, category) {
  const breadcrumbs = [
    { label: 'home', href: `/` },
    { label: 'products', href: `/products` }
  ];

  if (category) {
    breadcrumbs.push({
      label: 'category',
      href: `/products?category=${encodeURIComponent(category)}`
    });
  }

  breadcrumbs.push({ label: productName });

  return breadcrumbs;
}

/**
 * 生成产品列表页面的面包屑
 */
export function generateProductListBreadcrumbs(lang, category) {
  const breadcrumbs = [
    { label: 'home', href: `/` }
  ];

  if (category) {
    breadcrumbs.push({ label: 'products', href: `/products` });
    breadcrumbs.push({ label: category });
  } else {
    breadcrumbs.push({ label: 'products' });
  }

  return breadcrumbs;
}

/**
 * 生成新闻页面的面包屑
 */
export function generateNewsBreadcrumbs(lang, page) {
  const breadcrumbs = [
    { label: 'home', href: `/` },
    { label: 'news', href: page && page > 1 ? `/news/${page}` : `/news` }
  ];

  return breadcrumbs;
}

/**
 * 生成新闻详情页面的面包屑
 */
export function generateNewsDetailBreadcrumbs(lang, newsTitle) {
  return [
    { label: 'home', href: `/` },
    { label: 'news', href: `/news` },
    { label: newsTitle }
  ];
}

/**
 * 生成案例页面的面包屑
 */
export function generateCaseBreadcrumbs(lang, page) {
  const breadcrumbs = [
    { label: 'home', href: `/` },
    { label: 'case', href: page && page > 1 ? `/case/${page}` : `/case` }
  ];

  return breadcrumbs;
}

/**
 * 生成案例详情页面的面包屑
 */
export function generateCaseDetailBreadcrumbs(lang, caseTitle) {
  return [
    { label: 'home', href: `/` },
    { label: 'case', href: `/case` },
    { label: caseTitle }
  ];
}

/**
 * 生成关于页面的面包屑
 */
export function generateAboutBreadcrumbs(lang) {
  return [
    { label: 'home', href: `/` },
    { label: 'about' }
  ];
}

/**
 * 生成联系页面的面包屑
 */
export function generateContactBreadcrumbs(lang) {
  return [
    { label: 'home', href: `/` },
    { label: 'contact' }
  ];
}

/**
 * 生成搜索页面的面包屑
 */
export function generateSearchBreadcrumbs(lang, searchTerm) {
  return [
    { label: 'home', href: `/` },
    { label: 'search', href: `/search` },
    { label: searchTerm || 'search' }
  ];
}

/**
 * 生成自定义面包屑
 */
export function generateCustomBreadcrumbs(lang, items) {
  const breadcrumbs = [
    { label: 'home', href: `/` }
  ];

  breadcrumbs.push(...items);

  return breadcrumbs;
} 