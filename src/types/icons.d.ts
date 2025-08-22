/**
 * 图标类型定义
 */

// 图标名称类型
export type IconName = string;

// 图标配置类型
export interface IconConfig {
  fontFamily: string;
  cssPrefix: string;
  defaultSize: string;
  baseClass: string;
}

// 图标映射表类型
export type IconMap = Record<string, string>;

// 图标分类类型
export type IconCategories = Record<string, string[]>;

// 渲染图标选项类型
export interface RenderIconOptions {
  size?: string;
  color?: string;
  className?: string;
  fallback?: string;
}

// 图标工具函数类型
export interface IconUtils {
  getIconClass: (iconName: string, fallback?: string) => string;
  hasIcon: (iconName: string) => boolean;
  getIconsByCategory: (category: string) => string[];
  getAllIconNames: () => string[];
  getIconClassName: (iconName: string, fallback?: string) => string;
  renderIcon: (iconName: string, options?: RenderIconOptions) => string;
  createIcon: (iconName: string, options?: RenderIconOptions) => HTMLElement;
  normalizeIconName: (iconName: string) => string | null;
  getBatchIconClasses: (iconNames: string[], fallback?: string) => Record<string, string>;
}

// 图标分类枚举
export enum IconCategory {
  Navigation = 'navigation',
  Product = 'product',
  News = 'news',
  Contact = 'contact',
  Social = 'social',
  Arrow = 'arrow',
  Action = 'action',
  Misc = 'misc'
}

// 导出所有类型
export {
  IconName,
  IconConfig,
  IconMap,
  IconCategories,
  RenderIconOptions,
  IconUtils,
  IconCategory
};
