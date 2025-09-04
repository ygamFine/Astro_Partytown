/**
 * 工具函数集合
 * 用于处理菜单数据转换、递归分类等功能
 */
const strapiStaticUrl = process.env.STRAPI_STATIC_URL || import.meta.env?.STRAPI_STATIC_URL;
/**
 * 处理图片url
 * @param imageUrl 图片url
 * @returns 
 */
export const imageProcess = (imageUrl: String) => {
    return strapiStaticUrl + imageUrl;
}
/**
 * 将扁平菜单数据转换为树形结构
 * @param {Array} flatMenus - 扁平菜单数据数组
 * @param {string} parentIdField - 父级ID字段名，默认为 'parent'
 * @param {string} idField - 菜单项ID字段名，默认为 'id'
 * @param {string} childrenField - 子菜单字段名，默认为 'children'
 * @returns {Array} 树形结构的菜单数据
 */
export function buildMenuTree(flatMenus: any[], parentIdField = 'parent', idField = 'id', childrenField = 'children'): any[] {
  if (!Array.isArray(flatMenus) || flatMenus.length === 0) {
    return [];
  }

  // 创建ID到菜单项的映射
  const menuMap = new Map();
  const rootMenus: any[] = [];

  // 第一遍遍历：创建所有菜单项的映射
  flatMenus.forEach(menu => {
    const menuId = menu[idField];
    if (menuId !== undefined && menuId !== null) {
      // 确保每个菜单项都有children数组
      menu[childrenField] = [];
      menuMap.set(menuId, menu);
    }
  });

  // 第二遍遍历：构建父子关系
  flatMenus.forEach(menu => {
    const parentId = menu[parentIdField];

    if (parentId && parentId !== null && parentId !== undefined) {
      // 如果有父级，将当前菜单项添加到父级的children中
      const parentMenu = menuMap.get(parentId);
      if (parentMenu) {
        parentMenu[childrenField].push(menu);
      }
    } else {
      // 如果没有父级，则为根级菜单
      rootMenus.push(menu);
    }
  });

  return rootMenus;
}


/**
 * 递归提取对象中的URL，优先取出media下面的url
 * @param {any} obj - 要搜索的对象
 * @returns {string|null} 找到的URL或null
 */
export function extractUrl(obj: any, isFullUrl = false): string | null {
  if (!obj || typeof obj !== 'object') return null;

  // 优先查找 media.url
  if (obj.media?.url) return isFullUrl ? strapiStaticUrl + obj.media.url : obj.media.url;

  // 其次查找直接的url
  if (obj.url) return isFullUrl ? strapiStaticUrl + obj.url : obj.url;

  // 递归搜索所有属性
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) {
      const result = extractUrl(value, isFullUrl);
      if (result) return result;
    }
  }

  return null;
}
