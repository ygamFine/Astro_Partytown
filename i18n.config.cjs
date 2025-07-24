module.exports = {
  // 从环境变量获取启用的语言列表
  enabledLanguages: process.env.ENABLED_LANGUAGES 
    ? process.env.ENABLED_LANGUAGES.split(',') 
    : ['zh-CN', 'en', 'de', 'ja', 'ar'],
  
  // 默认语言
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
  
  // 支持的语言列表
  supportedLanguages: process.env.SUPPORTED_LANGUAGES 
    ? process.env.SUPPORTED_LANGUAGES.split(',') 
    : ['en', 'zh-CN', 'zh-Hant', 'fr', 'de', 'it', 'tr', 'es', 'pt-pt', 'nl', 'pl', 'ar', 'ru', 'th', 'id', 'vi', 'ms', 'ml', 'my', 'hi', 'ja', 'ko']
};  