// 公共语言文件加载工具
import { DEFAULT_LANGUAGE } from '../locales/i18n.js';

/**
 * 加载公共语言文件
 * @param {string} locale - 语言代码
 * @returns {Promise<Object>} 公共语言数据
 */
export async function loadCommonTranslations(locale) {
  try {
    const common = await import(`../locales/${locale}/common.json`);
    return common.default || {};
  } catch (error) {
    // 如果加载失败，回退到默认语言
    if (locale !== DEFAULT_LANGUAGE) {
  
      return loadCommonTranslations(DEFAULT_LANGUAGE);
    }

    return {};
  }
}

/**
 * 获取公共语言文本
 * @param {string} locale - 语言代码
 * @param {string} key - 键路径，如 'placeholders.search'
 * @param {Object} params - 替换参数
 * @returns {Promise<string>} 翻译文本
 */
export async function getCommonText(locale, key, params = {}) {
  const common = await loadCommonTranslations(locale);
  
  // 解析键路径
  const keys = key.split('.');
  let value = common;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 如果找不到，回退到默认语言
      if (locale !== DEFAULT_LANGUAGE) {
        return getCommonText(DEFAULT_LANGUAGE, key, params);
      }
      return key; // 返回键名作为默认值
    }
  }
  
  // 如果值是字符串，替换参数
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }
  
  return value;
}

/**
 * 获取占位符文本
 * @param {string} locale - 语言代码
 * @param {string} field - 字段名
 * @returns {Promise<string>} 占位符文本
 */
export async function getPlaceholder(locale, field) {
  return getCommonText(locale, `placeholders.${field}`);
}

/**
 * 获取标签文本
 * @param {string} locale - 语言代码
 * @param {string} field - 字段名
 * @returns {Promise<string>} 标签文本
 */
export async function getLabel(locale, field) {
  return getCommonText(locale, `labels.${field}`);
}

/**
 * 获取按钮文本
 * @param {string} locale - 语言代码
 * @param {string} action - 动作名
 * @returns {Promise<string>} 按钮文本
 */
export async function getButtonText(locale, action) {
  return getCommonText(locale, `buttons.${action}`);
}

/**
 * 获取验证消息
 * @param {string} locale - 语言代码
 * @param {string} type - 验证类型
 * @param {Object} params - 替换参数
 * @returns {Promise<string>} 验证消息
 */
export async function getValidationMessage(locale, type, params = {}) {
  return getCommonText(locale, `validation.${type}`, params);
}

/**
 * 获取状态文本
 * @param {string} locale - 语言代码
 * @param {string} status - 状态名
 * @returns {Promise<string>} 状态文本
 */
export async function getStatusText(locale, status) {
  return getCommonText(locale, `status.${status}`);
}

/**
 * 获取搜索相关文本
 * @param {string} locale - 语言代码
 * @param {string} key - 搜索键名
 * @param {Object} params - 替换参数
 * @returns {Promise<string>} 搜索文本
 */
export async function getSearchText(locale, key, params = {}) {
  return getCommonText(locale, `search.${key}`, params);
}

/**
 * 获取分类标签
 * @param {string} locale - 语言代码
 * @param {string} category - 分类名
 * @returns {Promise<string>} 分类标签
 */
export async function getCategoryLabel(locale, category) {
  return getCommonText(locale, `categories.${category}`);
}

/**
 * 获取操作文本
 * @param {string} locale - 语言代码
 * @param {string} action - 操作名
 * @returns {Promise<string>} 操作文本
 */
export async function getActionText(locale, action) {
  return getCommonText(locale, `actions.${action}`);
}

/**
 * 获取消息文本
 * @param {string} locale - 语言代码
 * @param {string} message - 消息类型
 * @returns {Promise<string>} 消息文本
 */
export async function getMessageText(locale, message) {
  return getCommonText(locale, `messages.${message}`);
}

/**
 * 获取时间相关文本
 * @param {string} locale - 语言代码
 * @param {string} time - 时间类型
 * @returns {Promise<string>} 时间文本
 */
export async function getTimeText(locale, time) {
  return getCommonText(locale, `time.${time}`);
}

/**
 * 获取分页文本
 * @param {string} locale - 语言代码
 * @param {string} key - 分页键名
 * @returns {Promise<string>} 分页文本
 */
export async function getPaginationText(locale, key) {
  return getCommonText(locale, `pagination.${key}`);
}

/**
 * 获取单位文本
 * @param {string} locale - 语言代码
 * @param {string} unit - 单位名
 * @returns {Promise<string>} 单位文本
 */
export async function getUnitText(locale, unit) {
  return getCommonText(locale, `units.${unit}`);
}

/**
 * 同步获取公共语言文本（用于SSR）
 * @param {Object} common - 已加载的公共语言数据
 * @param {string} key - 键路径
 * @param {Object} params - 替换参数
 * @returns {string} 翻译文本
 */
export function getCommonTextSync(common, key, params = {}) {
  if (!common) return key;
  
  // 解析键路径
  const keys = key.split('.');
  let value = common;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // 返回键名作为默认值
    }
  }
  
  // 如果值是字符串，替换参数
  if (typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }
  
  return value;
}

/**
 * 预加载公共语言文件（用于SSR优化）
 * @param {string} locale - 语言代码
 * @returns {Promise<Object>} 公共语言数据
 */
export async function preloadCommonTranslations(locale) {
  return loadCommonTranslations(locale);
} 