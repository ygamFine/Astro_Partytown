/**
 * 菜单类型映射配置
 * 用于获取移动端菜单相关映射图标名称
 * 与 ICON_MAP 映射关系一致
 * key 为 field_liebiao 字段的唯一标识
 * value 为 ICON_MAP 映射关系中的图标名称
 */
export const MENU_ICON_MAPPING = {
    'home': 'home',                           // icon-home 🏠
    'product': 'chanpin',                     // icon-chanpin 📦
    'phone': 'phone',                         // icon-contact_icon_iphone 📞
    'whatsapp': 'whatsapp',                   // icon-whatsapp 💚 (绿色WhatsApp)
    'email': 'mailbox',                         // icon-contact_icon_email 📧
    'news': 'xinwenshoucang',                 // icon-xinwenshoucang 📰
    'aboutus': 'people',                      // icon-contact_icon_people2 👥
    'contactus': 'mailbox',                     // icon-contact_icon_email 📧
    'vr': 'vr-player',                        // icon-vrbofangqi 🥽
    'videos': 'youtube'                       // icon-youtube 📺
} as const;

/**
 * 菜单类型
 */
export type MenuType = keyof typeof MENU_TYPE_MAPPING;

/**
 * 菜单类型映射配置
 * 用于获取移动端菜单名称
 * key 为 field_liebiao 字段的唯一标识
 * value 为 特殊类型名称
 */
export const MENU_TYPE_MAPPING = {
    'phone': 'phone',
    'whatsapp': 'whatsapp',
    'email': 'email',
} as const;

/**
 * 关键词归属模块映射
 * key 为 关键词归属模块的唯一标识
 * value 为 关键词归属模块的名称
 */
export const KEY_WORDS_CONTENT_TYPE = {
    'api::product-category.product-category': '/products',
    'api::product-manage.product-manage': '/products',
    'api::newcategory.newcategory': '/news',
    'api::new.new': '/news',
    'api::case-category.case-category': '/case',
    'api::case.case': '/case',
} as const;

/**
 * API请求 每页条数
 */
export const API_PAGE_SIZE = 99999;

/** 
 * 每页显示的数据条数
 */
export const PAGE_SIZE = 1;