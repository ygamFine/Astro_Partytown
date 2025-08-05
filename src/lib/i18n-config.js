// 只在服务端运行，避免浏览器兼容性问题
let enabledLanguages = null;
let defaultLanguage = null;

// 检查是否在服务端环境
const isServer = typeof window === 'undefined';

if (isServer) {
  try {
    const { readFileSync } = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const configPath = join(__dirname, '../../i18n.config.cjs');
    const configContent = readFileSync(configPath, 'utf8');
    
    // 动态执行 CommonJS 模块
    const module = { exports: {} };
    const require = (path) => {
      if (path === 'path') return { join };
      if (path === 'fs') return { readFileSync };
      throw new Error(`Cannot require: ${path}`);
    };
    
    // 安全地执行配置文件
    const func = new Function('module', 'exports', 'require', configContent);
    func(module, module.exports, require);
    
    enabledLanguages = module.exports.enabledLanguages;
    defaultLanguage = module.exports.defaultLanguage || 'en';
  } catch (error) {

    enabledLanguages = ['zh-CN', 'en', 'fr', 'de'];
    defaultLanguage = 'en';
  }
} else {
  // 浏览器环境使用默认配置
  enabledLanguages = ['zh-CN', 'en', 'fr', 'de'];
  defaultLanguage = 'en';
}

/**
 * 获取启用的语言列表
 * @returns {string[]} 启用的语言代码数组
 */
export function getEnabledLanguages() {
  return enabledLanguages || ['zh-CN', 'en', 'fr', 'de'];
}

/**
 * 检查语言是否启用
 * @param {string} lang 语言代码
 * @returns {boolean} 是否启用
 */
export function isLanguageEnabled(lang) {
  const languages = getEnabledLanguages();
  return languages.includes(lang);
}

/**
 * 获取默认语言
 * @returns {string} 默认语言代码
 */
export function getDefaultLanguage() {
  return defaultLanguage || 'en';
} 