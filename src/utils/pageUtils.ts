/**
 * 页面工具函数
 * 用于处理分页逻辑、分类路径解析、产品筛选等功能
 */

import { SUPPORTED_LANGUAGES } from './i18n-routes';
import { getMenus, getProducts, getByCategory } from '@apis/common';
import { filterCategories } from './categories';

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
  currentPage: number;
  totalPages: number;
  items: any[];
}

export interface CategoryPaginationProps extends PaginationProps {
  categoryPath: string[] | { path: string; name: string };
}

export interface StaticPath {
  params: {
    lang: string;
    page?: string;
  };
  props: PaginationProps | CategoryPaginationProps;
}

export type DataFetcher = (lang: string, categoryPath?: string[]) => Promise<any[]>;
export type ContentType = 'product' | 'news' | 'case';

// 生成分页路径
export async function generatePaginationPaths(dataFetcher: DataFetcher, itemsPerPage: number): Promise<StaticPath[]> {
  const paths: StaticPath[] = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    try {
      const allItems = await dataFetcher(lang);
      const totalPages = Math.ceil(allItems.length / itemsPerPage);

      // 总是生成至少第一页，即使没有数据
      const actualTotalPages = Math.max(1, totalPages); // 至少1页

      // 第一页
      paths.push({
        params: { lang, page: undefined },
        props: {
          lang,
          currentPage: 1,
          totalPages: actualTotalPages,
          items: allItems.length > 0 ? allItems.slice(0, itemsPerPage) : []
        }
      });

      // 其他页面（如果有数据的话）
      for (let i = 2; i <= actualTotalPages; i++) {
        const pageParam = i.toString();
        paths.push({
          params: { lang, page: pageParam },
          props: {
            lang,
            currentPage: i,
            totalPages: actualTotalPages,
            items: allItems.length > 0 ? allItems.slice((i - 1) * itemsPerPage, i * itemsPerPage) : []
          }
        });
      }
    } catch (error) {
      console.error(`生成语言 ${lang} 的分页路径失败:`, error);
      // 如果获取数据失败，至少生成第一页
      paths.push({
        params: { lang, page: undefined },
        props: {
          lang,
          currentPage: 1,
          totalPages: 0,
          items: []
        }
      });
    }
  }
  return paths;
}

// 解析页码参数
export function parsePageParam(pageParam: string | undefined, pagePrefix = ''): number {
  if (!pageParam) return 1;

  const pageNumber = parseInt(pageParam);
  return !isNaN(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
}

// 根据分类路径获取产品
export async function getProductsByCategoryPath(lang: string, categoryPath: string[]): Promise<Product[]> {
  const allProducts: Product[] = await getProducts(lang);

  if (categoryPath.length === 0) {
    return allProducts;
  }

  return allProducts.filter(product => {
    if (product.category_path && Array.isArray(product.category_path)) {
      return categoryPath.every((segment, index) =>
        product.category_path![index] === segment
      );
    }

    if (product.product_category) {
      const productCategoryPath = product.product_category.url_slug ||
        product.product_category.path ||
        product.product_category.name;
      return categoryPath.includes(productCategoryPath);
    }

    return false;
  });
}

// 获取分类信息
export async function getCategoryInfo(lang: string, categoryPath: string[], mode = 'products'): Promise<CategoryInfo> {
  const menus: MenuItem[] = await getMenus(lang);
  let current: MenuItem | null = null;
  let children: MenuItem[] = [];
  let parents: Array<{
    id: string | number;
    name: string;
    path: string;
    level: number;
  }> = [];

  const filterMenus = menus.filter(menu =>
    menu.path?.includes(mode)
  );

  if (filterMenus.length > 0) {
    let currentLevel = filterMenus[0].children || [];

    for (let i = 0; i < categoryPath.length; i++) {
      const pathSegment = categoryPath[i];
      current = currentLevel.find(cat => cat.path.includes(pathSegment)) || null;
      if (!current) break;
      parents.push({
        id: current.id,
        name: current.name,
        path: current.path,
        level: i + 1
      });

      currentLevel = current.children || [];
    }

    children = currentLevel;
  }

  return {
    current: current || { id: '', name: '', path: '' },
    children: children,
    parents: parents,
    level: categoryPath.length
  };
}


// 生成所有分类的分页路径（支持多语言，优化性能）
export async function generateAllCategoryPaths(dataFetcher: DataFetcher, itemsPerPage: number, mode: string): Promise<StaticPath[]> {
  // 并行处理所有语言
  const languagePromises = SUPPORTED_LANGUAGES.map(async (lang: string) => {
    const menus: MenuItem[] = await getMenus(lang);
    const productMenus = menus.filter(menu =>
      menu.path?.includes(mode)
    );

    // 收集所有分类路径
    const allCategoryPaths: string[][] = [];
    function collectCategoryPaths(categories: MenuItem[] | undefined, currentPath: string[] = []): void {
      categories?.forEach(category => {
        const newPath = [...currentPath, category.path];
        allCategoryPaths.push(newPath);

        if (category.children && category.children.length > 0 && newPath.length < 3) {
          collectCategoryPaths(category.children, newPath);
        }
      });
    }

    productMenus.forEach(menu => {
      collectCategoryPaths(menu.children);
    });

    // 并行获取所有分类的数据
    const dataPromises = allCategoryPaths.map(async (categoryPath: string[]) => {
      try {
        const datas = await dataFetcher(lang, categoryPath);
        return { categoryPath, datas };
      } catch (error) {
        console.error(`获取分类 ${categoryPath.join('/')} 数据失败:`, error);
        // 即使获取数据失败，也返回空数组，确保页面能正常访问
        return { categoryPath, datas: [] };
      }
    });

    const categoryData = await Promise.all(dataPromises);

    // 生成路径
    const langPaths: StaticPath[] = [];
    categoryData.forEach(({ categoryPath, datas }) => {
      const totalPages = Math.max(1, Math.ceil(datas.length / itemsPerPage)); // 至少生成1页

      for (let page = 1; page <= totalPages; page++) {
        const pageParam = page === 1 ? undefined : page.toString();
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        langPaths.push({
          params: {
            lang,
            page: categoryPath.length > 0 ? `${categoryPath.join('/')}${pageParam ? `/${pageParam}` : ''}` : pageParam
          },
          props: {
            lang,
            categoryPath: categoryPath,
            currentPage: page,
            totalPages,
            items: datas.length > 0 ? datas.slice(startIndex, endIndex) : [] // 确保总是返回数组
          }
        });
      }
    });

    return langPaths;
  });

  // 等待所有语言处理完成
  const allLangPaths = await Promise.all(languagePromises);

  // 扁平化结果
  return allLangPaths.flat();
}

/**
 * 生成页面的静态路径（包含分类和分页）
 * 这是从 [...path].astro 中提取的通用逻辑
 * @param {number} productsPerPage - 每页产品数量
 * @param {string} contentType - 内容类型，如 'product'
 * @returns {Promise<Array>} 静态路径数组
 */
export async function generateStaticPaths(perPage = 9, contentType: ContentType = 'product'): Promise<StaticPath[]> {
  const paths: StaticPath[] = [];

  try {
    // 并行处理所有语言，提高性能
    const languagePromises = SUPPORTED_LANGUAGES.map(async (lang: string) => {
      const langPaths: StaticPath[] = [];
      try {
        // 一次性获取所有数据，避免重复调用接口
        const allData = await getByCategory(lang, '', contentType);
        console.log('allData', allData);
        // 添加路径
        const totalPages = Math.max(1, Math.ceil(allData.length / perPage));
        for (let page = 1; page <= totalPages; page++) {
          const startIndex = (page - 1) * perPage;
          const endIndex = startIndex + perPage;
          const currentPageItems = allData.slice(startIndex, endIndex);
          const params = page === 1
            ? { lang, page: undefined }
            : { lang, page: page.toString() };

          langPaths.push({
            params,
            props: {
              lang,
              categoryPath: [],
              currentPage: page,
              totalPages,
              items: currentPageItems
            }
          });
        }

        // 获取并过滤分类
        const allCategories = await getMenus(lang);
        const filteredCategories = filterCategories(allCategories);

        // 递归收集所有分类及其分页路径
        const collectPaths = async (categories: MenuItem[], parentPath = ''): Promise<void> => {
          const categoryPromises = categories.map(async (category: MenuItem) => {
            const fullPath = parentPath
              ? `${parentPath}/${category.path}`
              : category.path;
            try {
              // 从已获取的所有产品中过滤出该分类的产品
              const categoryData = allData.filter((item: any) => {
                if (item[contentType + '_category']) {
                  const itemCategoryPath = item[contentType + '_category'].url_slug ||
                    item[contentType + '_category'].path ||
                    item[contentType + '_category'].name;
                  return itemCategoryPath === category.path;
                }
                return false;
              });
              const totalPages = Math.max(1, Math.ceil(categoryData.length / perPage));

              // 为每个分页生成路径
              for (let page = 1; page <= totalPages; page++) {
                const startIndex = (page - 1) * perPage;
                const endIndex = startIndex + perPage;
                const currentPageItems = categoryData.slice(startIndex, endIndex);

                // 构建路径参数
                const pathSegments = fullPath.split('/').filter((segment) => segment !== '');
                const pathString = pathSegments.join('/');
                const params = page === 1
                  ? { lang, page: pathString }
                  : { lang, page: `${pathString}/${page}` };
                langPaths.push({
                  params,
                  props: {
                    lang,
                    categoryPath: {
                      path: fullPath,
                      name: category.name
                    },
                    currentPage: page,
                    totalPages,
                    items: currentPageItems
                  }
                });
              }

              // 递归处理子分类
              if (category.children && category.children.length > 0) {
                await collectPaths(category.children, fullPath);
              }
            } catch (error) {
              console.error(`处理分类 ${category.path} 失败:`, error);
            }
          });

          await Promise.all(categoryPromises);
        };

        await collectPaths(filteredCategories);
      } catch (error) {
        console.error(`处理语言 ${lang} 失败:`, error);
        // 如果获取失败，至少提供一个空页面
        langPaths.push({
          params: { lang, page: undefined },
          props: {
            lang,
            categoryPath: [],
            currentPage: 1,
            totalPages: 1,
            items: []
          }
        });
      }
      return langPaths;
    });

    // 等待所有语言处理完成
    const allLangPaths = await Promise.all(languagePromises);
    paths.push(...allLangPaths.flat());

    return paths.length > 0 ? paths : [];
  } catch (error) {
    console.error('生成静态路径失败:', error);
    return [];
  }
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
      lang,
      currentPage: 1,
      totalPages: 1,
      items: []
    }
  }));
  
  return paths;
}