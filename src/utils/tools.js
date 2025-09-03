/**
 * 工具函数集合
 * 用于处理菜单数据转换、递归分类等功能
 */

/**
 * 将扁平菜单数据转换为树形结构
 * @param {Array} flatMenus - 扁平菜单数据数组
 * @param {string} parentIdField - 父级ID字段名，默认为 'parent'
 * @param {string} idField - 菜单项ID字段名，默认为 'id'
 * @param {string} childrenField - 子菜单字段名，默认为 'children'
 * @returns {Array} 树形结构的菜单数据
 */
export function buildMenuTree(flatMenus, parentIdField = 'parent', idField = 'id', childrenField = 'children') {
  if (!Array.isArray(flatMenus) || flatMenus.length === 0) {
    return [];
  }

  // 创建ID到菜单项的映射
  const menuMap = new Map();
  const rootMenus = [];

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
 * 递归处理菜单数据，支持多层级嵌套
 * @param {Array} menus - 菜单数据数组
 * @param {Function} processor - 处理每个菜单项的函数
 * @param {string} childrenField - 子菜单字段名，默认为 'children'
 * @returns {Array} 处理后的菜单数据
 */
export function processMenuRecursively(menus, processor, childrenField = 'children') {
  if (!Array.isArray(menus)) {
    return menus;
  }

  return menus.map(menu => {
    // 处理当前菜单项
    const processedMenu = processor(menu);
    
    // 递归处理子菜单
    if (processedMenu[childrenField] && Array.isArray(processedMenu[childrenField])) {
      processedMenu[childrenField] = processMenuRecursively(
        processedMenu[childrenField], 
        processor, 
        childrenField
      );
    }
    
    return processedMenu;
  });
}

/**
 * 根据菜单路径查找菜单项
 * @param {Array} menus - 菜单数据数组
 * @param {string} path - 要查找的路径
 * @param {string} childrenField - 子菜单字段名，默认为 'children'
 * @returns {Object|null} 找到的菜单项或null
 */
export function findMenuByPath(menus, path, childrenField = 'children') {
  if (!Array.isArray(menus)) {
    return null;
  }

  for (const menu of menus) {
    if (menu.path === path) {
      return menu;
    }
    
    if (menu[childrenField] && Array.isArray(menu[childrenField])) {
      const found = findMenuByPath(menu[childrenField], path, childrenField);
      if (found) {
        return found;
      }
    }
  }
  
  return null;
}

/**
 * 获取菜单的完整路径（从根到当前项）
 * @param {Array} menus - 菜单数据数组
 * @param {string} targetPath - 目标路径
 * @param {string} childrenField - 子菜单字段名，默认为 'children'
 * @returns {Array} 路径数组，包含从根到目标的所有菜单项
 */
export function getMenuPath(menus, targetPath, childrenField = 'children') {
  const path = [];
  
  function findPath(menuList, target, currentPath) {
    for (const menu of menuList) {
      const newPath = [...currentPath, menu];
      
      if (menu.path === target) {
        path.push(...newPath);
        return true;
      }
      
      if (menu[childrenField] && Array.isArray(menu[childrenField])) {
        if (findPath(menu[childrenField], target, newPath)) {
          return true;
        }
      }
    }
    return false;
  }
  
  findPath(menus, targetPath, []);
  return path;
}

/**
 * 扁平化树形菜单数据
 * @param {Array} treeMenus - 树形菜单数据
 * @param {string} childrenField - 子菜单字段名，默认为 'children'
 * @returns {Array} 扁平化的菜单数据
 */
export function flattenMenuTree(treeMenus, childrenField = 'children') {
  const result = [];
  
  function flatten(menus) {
    menus.forEach(menu => {
      const { [childrenField]: children, ...menuWithoutChildren } = menu;
      result.push(menuWithoutChildren);
      
      if (children && Array.isArray(children)) {
        flatten(children);
      }
    });
  }
  
  flatten(treeMenus);
  return result;
}

/**
 * 获取菜单的最大深度
 * @param {Array} menus - 菜单数据数组
 * @param {string} childrenField - 子菜单字段名，默认为 'children'
 * @returns {number} 菜单的最大深度
 */
export function getMenuMaxDepth(menus, childrenField = 'children') {
  if (!Array.isArray(menus) || menus.length === 0) {
    return 0;
  }
  
  function getDepth(menuList, currentDepth = 1) {
    let maxDepth = currentDepth;
    
    for (const menu of menuList) {
      if (menu[childrenField] && Array.isArray(menu[childrenField])) {
        const childDepth = getDepth(menu[childrenField], currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
    
    return maxDepth;
  }
  
  return getDepth(menus);
}
