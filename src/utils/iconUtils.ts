/**
 * 图标工具函数
 * 提供全站统一的图标处理方法
 */

import { ICON_MAP, ICON_CONFIG } from '@config/icons.js';
import { MENU_ICON_MAPPING } from '@config/constant.js';

/**
 * 获取图标的CSS类名
 * @param iconName - 图标名称
 * @param fallback - 默认图标名称
 * @returns 完整的图标CSS类名
 */
export function getIconClass(iconName: string | undefined | null, fallback: string = 'default'): string {
  const iconKey = iconName?.toLowerCase()?.trim();
  const mappedClass = (iconKey && iconKey in ICON_MAP ? ICON_MAP[iconKey as keyof typeof ICON_MAP] : null) 
    || (fallback in ICON_MAP ? ICON_MAP[fallback as keyof typeof ICON_MAP] : null)
    || ICON_MAP.default;
  return `${ICON_CONFIG.baseClass} ${mappedClass}`;
}


/**
 * 获取移动端菜单相关图标
 * @param item - 菜单项
 * @returns 图标类名
 */
export function getMobileBottomMenuIcon(item: any): string {
  // 优先根据 field_liebiao 字段的唯一标识判断类型
  const fieldLiebiao = item.field_liebiao || '';
  const uniqueId = fieldLiebiao.includes('|') ? fieldLiebiao.split('|')[0].toLowerCase().trim() : fieldLiebiao.toLowerCase().trim();
  
  // 使用 MENU_TYPE_MAPPING 映射关系获取图标类型
  const menuType = MENU_ICON_MAPPING[uniqueId as keyof typeof MENU_ICON_MAPPING];
  if (menuType) {
    const icon = ICON_MAP[menuType as keyof typeof ICON_MAP];
    if (icon) {
      return icon;
    }
  }
  
  // 如果映射不存在，直接尝试使用唯一标识
  const icon = ICON_MAP[uniqueId as keyof typeof ICON_MAP];
  if (icon) {
    return icon;
  }
  
  // 如果都不存在，则使用默认图标
  return ICON_MAP.default;
}