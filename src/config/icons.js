/**
 * 字体图标库配置
 * 统一管理全站图标映射关系
 */

// 字体图标类名映射表
export const ICON_MAP = {
  // === 基础导航图标 ===
  home: 'icon-home1',
  search: 'icon-common_icon_search',
  menu: 'icon-navbar-Burger-menu',
  grid: 'icon-common_icon_grid',
  
  // === 产品相关图标 ===
  package: 'icon-chanpin',
  chanpin: 'icon-chanpin',
  products: 'icon-chanpin',
  equipment: 'icon-shebei',
  
  // === 新闻资讯图标 ===
  newspaper: 'icon-xinwenshoucang',
  news: 'icon-xinwenshoucang',
  xinwenshoucang: 'icon-xinwenshoucang',
  
  // === 联系交流图标 ===
  'message-circle': 'icon-lianxiwomen1',
  contact: 'icon-lianxiwomen1',
  lianxiwomen1: 'icon-lianxiwomen1',
  email: 'icon-contact_icon_email',
  phone: 'icon-contact_icon_iphone',
  'dianhua-telephone': 'icon-dianhua-Telephone',
  fax: 'icon-chuanzhen2',
  address: 'icon-common_icon_fill_address',
  people: 'icon-contact_icon_people2',
  
  // === 社交媒体图标 ===
  whatsapp: 'icon-whatsapp',
  whatsapp1: 'icon-whatsapp1',
  whatsapp2: 'icon-whatsapp2',
  'social-whatsapp': 'icon-social_icon_whatsup',
  wechat: 'icon-wechat',
  skype: 'icon-skype',
  youtube: 'icon-youtube',
  youtube1: 'icon-youtube1',
  youtube2: 'icon-youtube2',
  'personal-youtube': 'icon-personal-icon-youtube1',
  twitter: 'icon-twitter',
  twitter1: 'icon-twitter1',
  'a-twitter': 'icon-a-tuite1',
  linkedin: 'icon-linkedin',
  facebook: 'icon-lianshu',
  facebook2: 'icon-lianshu2',
  instagram: 'icon-social_icon_ins',
  google: 'icon-google',
  google1: 'icon-google1',
  alibaba: 'icon-alibaba1',
  douyin: 'icon-douyin',
  
  // === 箭头方向图标 ===
  'arrow-up': 'icon-arrowup',
  'arrow-down': 'icon-arrowdown',
  'arrow-left': 'icon-arrowleft',
  'arrow-right': 'icon-arrowright',
  'common-up': 'icon-common_icon_up',
  'common-down': 'icon-common_icon_down',
  'jiantou': 'icon-a-jiantou1',
  'jiantou-copy': 'icon-a-jiantou1-copy',
  'return-top': 'icon-returntop',
  
  // === 功能操作图标 ===
  close: 'icon-guanbi',
  check: 'icon-check',
  'common-check': 'icon-common_fill_check',
  warning: 'icon-common_fill_warning',
  download: 'icon-xiazai1',
  play: 'icon-paly',
  buy: 'icon-goumai',
  list: 'icon-common_icon_list1',
  
  // === 其他图标 ===
  world: 'icon-diqiu',
  language: 'icon-nav_icon_language',
  'made-china': 'icon-madechina',
  'vr-player': 'icon-vrbofangqi',
  mailbox: 'icon-youxiang',
  mailbox6: 'icon-youxiang6',
  resource: 'icon-a-ziyuan2mdpi',
  
  // === 默认图标 ===
  circle: 'icon-common_icon_grid',
  default: 'icon-common_icon_grid'
};

// 图标分类
export const ICON_CATEGORIES = {
  navigation: ['home', 'search', 'menu', 'grid'],
  product: ['package', 'chanpin', 'products', 'equipment'],
  news: ['newspaper', 'news', 'xinwenshoucang'],
  contact: ['message-circle', 'contact', 'lianxiwomen1', 'email', 'phone', 'dianhua-telephone', 'fax', 'address', 'people'],
  social: ['whatsapp', 'whatsapp1', 'whatsapp2', 'social-whatsapp', 'wechat', 'skype', 'youtube', 'youtube1', 'youtube2', 'personal-youtube', 'twitter', 'twitter1', 'a-twitter', 'linkedin', 'facebook', 'facebook2', 'instagram', 'google', 'google1', 'alibaba', 'douyin'],
  arrow: ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'common-up', 'common-down', 'jiantou', 'jiantou-copy', 'return-top'],
  action: ['close', 'check', 'common-check', 'warning', 'download', 'play', 'buy', 'list'],
  misc: ['world', 'language', 'made-china', 'vr-player', 'mailbox', 'mailbox6', 'resource']
};

// 字体图标基础配置
export const ICON_CONFIG = {
  fontFamily: 'iconfont',
  cssPrefix: 'icon-',
  defaultSize: '16px',
  baseClass: 'iconfont'
};
