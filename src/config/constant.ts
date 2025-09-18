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