// 统一的 语言 <-> 子域名 映射与工具

export const LANG_TO_SUBDOMAIN = {
  'en': 'en',
  'zh-CN': 'zh',
  'zh-Hant': 'zh-hant',
  'fr': 'fr',
  'de': 'de',
  'it': 'it',
  'tr': 'tr',
  'es': 'es',
  'pt-pt': 'pt',
  'nl': 'nl',
  'pl': 'pl',
  'ar': 'ar',
  'ru': 'ru',
  'th': 'th',
  'id': 'id',
  'vi': 'vi',
  'ms': 'ms',
  'ml': 'ml',
  'my': 'my',
  'hi': 'hi',
  'ja': 'ja',
  'ko': 'ko'
};

export const SUBDOMAIN_TO_LANG = Object.fromEntries(
  Object.entries(LANG_TO_SUBDOMAIN).map(([lang, sub]) => [sub, lang])
);

export function langToSubdomain(lang) {
  return LANG_TO_SUBDOMAIN[lang] || 'en';
}

export function subdomainToLang(sub) {
  return SUBDOMAIN_TO_LANG[sub] || 'en';
}

export function getLangFromHostname(hostname) {
  if (!hostname) return 'en';
  const firstLabel = hostname.split('.')[0];
  return subdomainToLang(firstLabel);
}


