
/**
 * 构建完整的API URL，包含查询参数
 * @param baseUrl 基础URL
 * @param queryParams 查询参数对象（可选）
 * @returns 完整的URL字符串
 */
export function buildApiUrl(baseUrl: string, queryParams?: Record<string, any>): string {
  let url = baseUrl;
  if (queryParams) {
    const serializedParams = serializeQueryParams(queryParams);
    if (serializedParams) {
      url += `&${serializedParams}`;
    }
  }
  return url;
}
const strapiStaticUrl = process.env.PUBLIC_API_URL || import.meta.env?.PUBLIC_API_URL;
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
export function extractUrl(input: any, isFullUrl = false): Array<{url: string, name: string, alt: string, width: string, height: string}> {
  const result: Array<{url: string, name: string, alt: string, width: string, height: string}> = [];

  // 递归提取单个对象中的图片信息
  function extractFromObject(obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    // 优先查找 media.url
    if (obj.media?.url) {
      const url = isFullUrl ? strapiStaticUrl + obj.media.url : obj.media.url;
      const name = obj.media.name || obj.name || 'image';
      const alt = obj.alt || obj.media.alt || '';
      const width = obj.media.width || '';
      const height = obj.media.height || '';
      result.push({ url, name, alt, width, height });
      return;
    }

    // 其次查找直接的url
    if (obj.url) {
      const url = isFullUrl ? strapiStaticUrl + obj.url : obj.url;
      const name = obj.name || 'image';
      const alt = obj.alt || '';
      const width = obj.width || '';
      const height = obj.height || '';
      result.push({ url, name, alt, width, height });
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
    const normalizedSlug = normalizedBasePath.startsWith('/') ? urlSlug : `/${urlSlug}`;
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
export function getFirstImage(images: Array<{url: string, name: string, alt: string, width: string, height: string}> | null | undefined): {url: string, name: string, alt: string, width: string, height: string} | null {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }
  
  // 返回第一个有效的图片对象
  return images[0];
}


/**
 * 工具函数集合
 * 用于处理菜单数据转换、递归分类、URL序列化等功能
 */


// 工具函数：将嵌套对象转换为 URL 参数字符串（处理 [ ] 格式）
export function flattenParams(obj: Record<string, any>, parentKey = ''): Record<string, any> {
  let params = {};
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = parentKey ? `${parentKey}[${key}]` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 递归处理嵌套对象
      Object.assign(params, flattenParams(value, newKey));
    } else {
      (params as Record<string, any>)[newKey] = value;
    }
  });
  return params;
}

export function deepMerge(target: Record<string, any>, ...sources: Record<string, any>[]) {
  // 终止条件：若目标不是对象/数组，直接返回源（源为undefined则返回目标）
  if (target === null || typeof target !== 'object') return sources[0] ?? target;

  // 处理数组场景：合并数组（去重可选，此处保留全部元素，后数组元素追加）
  if (Array.isArray(target)) {
    return [...target, ...sources.filter(source => Array.isArray(source)).flat()];
  }

  // 处理对象场景：递归合并属性
  const merged = { ...target }; // 基于目标对象创建新对象，不修改原对象
  sources.forEach(source => {
    if (source && typeof source === 'object' && !Array.isArray(source)) {
      Object.keys(source).forEach(key => {
        merged[key] = deepMerge(merged[key], source[key]);
      });
    }
  });

  return merged;
}

/**
 * 序列化查询参数对象为URL查询字符串
 * @param queryParams 查询参数对象
 * @returns 序列化后的查询字符串
 */
export function serializeQueryParams(queryParams: Record<string, any>): string {
  const serializedParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      serializedParams.append(key, String(value));
    }
  });
  return serializedParams.toString();
}

/**
 * 根据 params 中的 lang 和 page 去重
 * @param arr 数组
 * @returns 去重后的数组
 */
export function uniqueByParamsLangAndPage(arr: any[]): any[] {
  const map = new Map<string, any>();
  arr.forEach((item: any) => {
    // 从 params 中获取 lang 和 page，兼容 params 可能不存在的情况
    const { params = {} } = item;
    const lang = params.lang ?? '';
    const page = params.page ?? '';
    const key = `${lang}|${page}`;

    // 检查是否已存在相同 key 的元素
    if (map.has(key)) {
      // 存在重复时，验证当前对象 props 下是否有 pages 字段
      const currentHasPages = item.props?.pages !== undefined;
      const existingItem = map.get(key);
      const existingHasPages = existingItem.props?.pages !== undefined;

      // 策略：优先保留有 pages 字段的；都有时保留后出现的；都没有时也保留后出现的
      if (currentHasPages || !existingHasPages) {
        map.set(key, item);
      }
    } else {
      // 不存在重复 key 时直接添加
      map.set(key, item);
    }
  });
  return Array.from(map.values());
}

/**
 * 路径拼接（确保片段之间仅一个斜杠）
 * @example
 * joinUrlPaths(['/', '/test/', '/ab']) => '/test/ab'
 * joinUrlPaths(['products', 'category/', '/item']) => 'products/category/item'
 */
export function joinUrlPaths(segments: Array<string | number | undefined | null>): string {
  if (!Array.isArray(segments) || segments.length === 0) return '';

  // 是否绝对路径：第一个非空片段以 / 开头或第一个片段就是 '/'
  const firstNonEmpty = segments.find(s => s !== undefined && s !== null && String(s).trim() !== '');
  const isAbsolute = typeof firstNonEmpty === 'string' && (firstNonEmpty === '/' || firstNonEmpty.startsWith('/'));

  const cleaned = segments
    .filter(s => s !== undefined && s !== null)
    .map(s => String(s))
    .filter(s => s.trim() !== '')
    .map(s => s.replace(/^\/+|\/+$/g, '')) // 去掉前后所有斜杠
    .filter(s => s !== '');

  const joined = cleaned.join('/');
  if (joined === '') return isAbsolute ? '/' : '';
  return isAbsolute ? `/${joined}` : joined;
}

/**
 * 序列化嵌套的filters对象为URL查询字符串
 * 例如: {product_category: {url_slug: '/test-code/'}} => filters[product_category][url_slug]=/test-code/
 * @param filters 嵌套的filters对象
 * @returns 序列化后的查询字符串
 */
export function serializeNestedFilters(filters: Record<string, any>): string {
  const params: string[] = [];
  
  const serializeObject = (obj: Record<string, any>, prefix: string): void => {
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const paramKey = prefix ? `${prefix}[${key}]` : key;
        if (typeof value === 'object' && !Array.isArray(value)) {
          // 递归处理嵌套对象
          serializeObject(value, paramKey);
        } else {
          // 最终值
          params.push(`${paramKey}=${encodeURIComponent(String(value))}`);
        }
      }
    });
  };
  
  serializeObject(filters, 'filters');
  return params.join('&');
}