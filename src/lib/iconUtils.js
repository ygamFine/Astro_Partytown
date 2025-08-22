/**
 * 图标工具函数
 * 提供全站统一的图标处理方法
 */

import { ICON_MAP, ICON_CONFIG, ICON_CATEGORIES } from '../config/icons.js';

/**
 * 获取图标的CSS类名
 * @param {string} iconName - 图标名称
 * @param {string} fallback - 默认图标名称
 * @returns {string} 完整的图标CSS类名
 */
export function getIconClass(iconName, fallback = 'default') {
  const iconKey = iconName?.toLowerCase()?.trim();
  const mappedClass = ICON_MAP[iconKey] || ICON_MAP[fallback] || ICON_MAP.default;
  return `${ICON_CONFIG.baseClass} ${mappedClass}`;
}

/**
 * 检查图标是否存在
 * @param {string} iconName - 图标名称
 * @returns {boolean} 是否存在该图标
 */
export function hasIcon(iconName) {
  const iconKey = iconName?.toLowerCase()?.trim();
  return iconKey && ICON_MAP.hasOwnProperty(iconKey);
}

/**
 * 获取图标分类中的所有图标
 * @param {string} category - 分类名称
 * @returns {string[]} 该分类下的所有图标名称
 */
export function getIconsByCategory(category) {
  return ICON_CATEGORIES[category] || [];
}

/**
 * 获取所有可用的图标名称
 * @returns {string[]} 所有图标名称数组
 */
export function getAllIconNames() {
  return Object.keys(ICON_MAP);
}

/**
 * 获取图标的原始类名（不包含基础类）
 * @param {string} iconName - 图标名称
 * @param {string} fallback - 默认图标名称
 * @returns {string} 原始图标类名
 */
export function getIconClassName(iconName, fallback = 'default') {
  const iconKey = iconName?.toLowerCase()?.trim();
  return ICON_MAP[iconKey] || ICON_MAP[fallback] || ICON_MAP.default;
}

/**
 * 生成图标HTML字符串（用于服务端渲染）
 * @param {string} iconName - 图标名称
 * @param {Object} options - 配置选项
 * @param {string} options.size - 图标大小（CSS类名，如'text-xl'）
 * @param {string} options.color - 颜色（CSS类名，如'text-blue-600'）
 * @param {string} options.className - 额外的CSS类名
 * @param {string} options.fallback - 默认图标名称
 * @returns {string} HTML字符串
 */
export function renderIcon(iconName, options = {}) {
  const {
    size = '',
    color = '',
    className = '',
    fallback = 'default'
  } = options;
  
  const iconClass = getIconClass(iconName, fallback);
  const classes = [iconClass, size, color, className].filter(Boolean).join(' ');
  
  return `<i class="${classes}"></i>`;
}

/**
 * 创建图标元素（用于客户端）
 * @param {string} iconName - 图标名称
 * @param {Object} options - 配置选项（同renderIcon）
 * @returns {HTMLElement} 图标元素
 */
export function createIcon(iconName, options = {}) {
  const {
    size = '',
    color = '',
    className = '',
    fallback = 'default'
  } = options;
  
  const icon = document.createElement('i');
  const iconClass = getIconClass(iconName, fallback);
  const classes = [iconClass, size, color, className].filter(Boolean).join(' ');
  
  icon.className = classes;
  return icon;
}

/**
 * 验证并标准化图标名称
 * @param {string} iconName - 图标名称
 * @returns {string|null} 标准化的图标名称，无效时返回null
 */
export function normalizeIconName(iconName) {
  if (!iconName || typeof iconName !== 'string') {
    return null;
  }
  
  const normalized = iconName.toLowerCase().trim();
  return hasIcon(normalized) ? normalized : null;
}

/**
 * 批量获取图标类名
 * @param {string[]} iconNames - 图标名称数组
 * @param {string} fallback - 默认图标名称
 * @returns {Object} 图标名称到类名的映射对象
 */
export function getBatchIconClasses(iconNames, fallback = 'default') {
  const result = {};
  iconNames.forEach(name => {
    result[name] = getIconClass(name, fallback);
  });
  return result;
}
