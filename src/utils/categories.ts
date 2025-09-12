// 分类数据类型定义
export interface Category {
    id: number;
    name: string;
    path: string;
    locale: string;
    publishedAt: string;
    parent: number | null;
    sort: number;
    children: Category[];
  }
  
// 配置一级分类的白名单（只允许这些一级分类的子分类被查询）
export const FIRST_LEVEL_WHITELIST = ['/products', '/news', '/case']; // 这里填入允许的一级分类path

/**
 * 过滤分类数据：
 * 1. 移除一级分类，只保留其下的子分类
 * 2. 只保留白名单中一级分类的子分类
 */
export function filterCategories(categories: Category[]): Category[] {
  const filtered: Category[] = [];
  
  categories.forEach(topLevelCategory => {
    // 检查当前一级分类是否在白名单中
    if (FIRST_LEVEL_WHITELIST.includes(topLevelCategory.path)) {
      // 将一级分类的子分类添加到结果中
      filtered.push(...topLevelCategory.children);
    }
  });
  
  // 按sort排序
  return filtered.sort((a, b) => (a.sort || 0) - (b.sort || 0));
}

/**
 * 递归扁平化分类结构
 */
export function flattenCategories(categories: Category[], parentPath = ''): Array<Category & { fullPath: string }> {
  const result: Array<Category & { fullPath: string }> = [];
  
  categories.forEach(category => {
    // 计算完整路径
    const fullPath = parentPath 
      ? `${parentPath.replace(/\/$/, '')}/${category.path.replace(/^\//, '')}`
      : category.path.replace(/^\//, '');
    
    result.push({
      ...category,
      fullPath
    });
    
    // 递归处理子分类
    if (category.children && category.children.length > 0) {
      result.push(...flattenCategories(category.children, fullPath));
    }
  });
  
  return result;
}

/**
 * 根据完整路径查找分类
 */
export function getCategoryByFullPath(
  categories: Category[], 
  fullPath: string, 
  parentPath = ''
): (Category & { fullPath: string }) | null {
  for (const category of categories) {
    const currentFullPath = parentPath 
      ? `${parentPath.replace(/\/$/, '')}/${category.path.replace(/^\//, '')}`
      : category.path.replace(/^\//, '');
      
    if (currentFullPath === fullPath) {
      return { ...category, fullPath: currentFullPath };
    }
    
    if (category.children && category.children.length > 0) {
      const found = getCategoryByFullPath(category.children, fullPath, currentFullPath);
      if (found) return found;
    }
  }
  
  return null;
}
   