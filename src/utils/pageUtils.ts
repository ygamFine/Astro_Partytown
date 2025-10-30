/**
 * 页面工具函数
 * 用于处理分页逻辑、分类路径解析、产品筛选等功能
 */

import { SUPPORTED_LANGUAGES } from './i18n-routes';

// 类型定义
export interface MenuItem {
  id: string | number;
  name: string;
  path: string;
  locale?: string;
  publishedAt?: string;
  parent?: string | number | null;
  sort?: number;
  children?: MenuItem[];
}

export interface Product {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  picture?: any;
  image?: { url: string; name: string };
  product_category?: {
    id: string | number;
    name: string;
    path?: string;
    url_slug?: string;
  };
  category_path?: string[];
  [key: string]: any;
}

export interface CategoryInfo {
  current: {
    id: string | number;
    name: string;
    path: string;
  };
  children: MenuItem[];
  parents: Array<{
    id: string | number;
    name: string;
    path: string;
    level: number;
  }>;
  level: number;
}

export interface PaginationProps {
  lang: string;
  pages?: {
    currentPage?: number;
    totalPages?: number;
    items?: any[];
  }
}


export interface CategoryPaginationProps extends PaginationProps {
  category: string[] | { path: string; name: string };
}

export interface StaticPath {
  params: {
    lang: string;
    page?: string;
  };
  props: PaginationProps | CategoryPaginationProps;
}


// 生成所有支持语言的静态路径
export function generateCommonStaticPaths(): StaticPath[] {
  if (!SUPPORTED_LANGUAGES.length) {
    console.warn('[i18n] 未获取到任何语言，generateStaticPaths 将返回空列表');
    return [];
  }

  const paths: StaticPath[] = SUPPORTED_LANGUAGES.map((lang: string) => ({
    params: { lang },
    props: {
      lang
    }
  }));

  return paths;
}



