/**
 * 通用分页工具
 * 用于处理分页逻辑和路径生成
 */

import { SUPPORTED_LANGUAGES } from './i18n-routes.js';

// 生成分页路径
export async function generatePaginationPaths(dataFetcher, itemsPerPage, pagePrefix = '') {
  const paths = [];
  
  for (const lang of SUPPORTED_LANGUAGES) {
    try {
      const allItems = await dataFetcher(lang);
      const totalPages = Math.ceil(allItems.length / itemsPerPage);
      
      // 只有当有数据时才生成页面
      if (allItems.length > 0) {
        // 第一页
        paths.push({
          params: { lang, page: undefined },
          props: { 
            lang,
            currentPage: 1,
            totalPages,
            items: allItems.slice(0, itemsPerPage)
          }
        });
        
        // 其他页面
        for (let i = 2; i <= totalPages; i++) {
          const pageParam = pagePrefix ? `${pagePrefix}-${i}` : i.toString();
          paths.push({
            params: { lang, page: pageParam },
            props: {
              lang,
              currentPage: i,
              totalPages,
              items: allItems.slice((i - 1) * itemsPerPage, i * itemsPerPage)
            }
          });
        }
      } else {
        // 即使没有数据也生成第一页
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
export function parsePageParam(pageParam, pagePrefix = '') {
  if (!pageParam) return 1;
  
  if (pagePrefix && pageParam.startsWith(`${pagePrefix}-`)) {
    const pageNumber = parseInt(pageParam.replace(`${pagePrefix}-`, ''));
    return !isNaN(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
  }
  
  const pageNumber = parseInt(pageParam);
  return !isNaN(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
}

// 计算分页信息
export function calculatePagination(items, itemsPerPage, currentPage = 1) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayItems = items.slice(startIndex, endIndex);
  
  return {
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    displayItems,
    hasItems: displayItems.length > 0
  };
} 