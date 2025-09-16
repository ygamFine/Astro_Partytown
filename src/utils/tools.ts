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
 * 递归提取对象中的图片信息，返回包含图片地址和名字的对象数组
 * @param {any} input - 要搜索的对象或对象数组
 * @param {boolean} isFullUrl - 是否返回完整URL
 * @returns {Array<{url: string, name: string}>} 图片信息对象数组
 */
export function extractUrl(input: any, isFullUrl = false): Array<{url: string, name: string}> {
  const result: Array<{url: string, name: string}> = [];

  // 递归提取单个对象中的图片信息
  function extractFromObject(obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    // 优先查找 media.url
    if (obj.media?.url) {
      const url = isFullUrl ? strapiStaticUrl + obj.media.url : obj.media.url;
      const name = obj.media.name || obj.name || 'image';
      result.push({ url, name });
      return;
    }

    // 其次查找直接的url
    if (obj.url) {
      const url = isFullUrl ? strapiStaticUrl + obj.url : obj.url;
      const name = obj.name || 'image';
      result.push({ url, name });
      return;
    }

    // 递归搜索所有属性
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        extractFromObject(value);
      }
    }
  }

  // 处理输入数据
  if (Array.isArray(input)) {
    input.forEach(item => extractFromObject(item));
  } else {
    extractFromObject(input);
  }

  return result;
}

/**
 * 格式化时间
 * @param date 时间字符串或Date对象
 * @param format 格式，默认为 'YYYY-MM-DD'
 * @returns 格式化后的时间字符串
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 生成URL - 自动处理url_slug前面的斜杠，支持开发/生产环境差异
 * @param lang 语言代码
 * @param basePath 基础路径，如 '/products', '/news' 等
 * @param urlSlug URL slug（可选，如果不提供则只处理basePath）
 * @param params 查询参数对象（可选）
 * @returns 完整的URL
 */
export function generateUrl(lang: string, basePath: string, urlSlug?: string, params?: Record<string, string>): string {
  // 检查参数是否存在
  if (!lang || !basePath) {
    return '';
  }
  
  // 如果提供了urlSlug且是HTTP地址，直接返回
  if (urlSlug && (urlSlug.startsWith('http://') || urlSlug.startsWith('https://'))) {
    return urlSlug;
  }
  
  // 确保 basePath 以 / 开头
  const normalizedBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`;
  
  // 构建完整路径
  let fullPath = normalizedBasePath;
  if (urlSlug) {
    // 确保 urlSlug 以 / 开头
    const normalizedSlug = urlSlug.startsWith('/') ? urlSlug : `/${urlSlug}`;
    fullPath = `${normalizedBasePath}${normalizedSlug}`;
  }
  
  // 添加查询参数
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    fullPath += `?${searchParams.toString()}`;
  }
  
  // 检查是否为开发环境
  const isDevelopment = import.meta.env.DEV;
  if (isDevelopment) {
    // 本地开发模式：添加语言前缀
    return `/${lang}${fullPath}`;
  } else {
    // 生产环境：子域名模式，直接返回路径
    return fullPath;
  }
}

/**
 * 获取第一个有效的图片对象
 * @param images extractUrl方法的返回值数组
 * @returns 第一个图片对象，如果没有则返回null
 */
export function getFirstImage(images: Array<{url: string, name: string}>): {url: string, name: string} | null {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }
  
  // 返回第一个有效的图片对象
  return images[0];
}
