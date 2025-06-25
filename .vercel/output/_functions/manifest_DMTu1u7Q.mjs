import 'kleur/colors';
import { e as decodeKey } from './chunks/astro/server_DTG_YkHq.mjs';
import 'clsx';
import 'cookie';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_Dcnbnc5u.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro%20+%20Partytown/","cacheDir":"file:///Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro%20+%20Partytown/node_modules/.astro/","outDir":"file:///Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro%20+%20Partytown/dist/","srcDir":"file:///Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro%20+%20Partytown/src/","publicDir":"file:///Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro%20+%20Partytown/public/","buildClientDir":"file:///Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro%20+%20Partytown/dist/client/","buildServerDir":"file:///Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro%20+%20Partytown/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"contact/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contact","isIndex":false,"type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact.astro","pathname":"/contact","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"products/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/products","isIndex":false,"type":"page","pattern":"^\\/products\\/?$","segments":[[{"content":"products","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/products.astro","pathname":"/products","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[],"routeData":{"route":"/api/strapi-proxy","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/strapi-proxy\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"strapi-proxy","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/strapi-proxy.js","pathname":"/api/strapi-proxy","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/src/pages/about.astro",{"propagation":"none","containsHead":true}],["/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/src/pages/contact.astro",{"propagation":"none","containsHead":true}],["/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/src/pages/news/[...page].astro",{"propagation":"none","containsHead":true}],["/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/src/pages/news/[slug].astro",{"propagation":"none","containsHead":true}],["/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/src/pages/products.astro",{"propagation":"none","containsHead":true}],["/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/src/pages/products/[slug].astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/api/strapi-proxy@_@js":"pages/api/strapi-proxy.astro.mjs","\u0000@astro-page:src/pages/contact@_@astro":"pages/contact.astro.mjs","\u0000@astro-page:src/pages/news/[slug]@_@astro":"pages/news/_slug_.astro.mjs","\u0000@astro-page:src/pages/news/[...page]@_@astro":"pages/news/_---page_.astro.mjs","\u0000@astro-page:src/pages/products@_@astro":"pages/products.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-page:src/pages/products/[slug]@_@astro":"pages/products/_slug_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_C7gBrPT0.mjs","\u0000@astrojs-manifest":"manifest_DMTu1u7Q.mjs","/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/src/components/Header.astro?astro&type=script&index=0&lang.ts":"_astro/Header.astro_astro_type_script_index_0_lang.vo6QhL0u.js","/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/src/components/SmartMenu.astro?astro&type=script&index=0&lang.ts":"_astro/SmartMenu.astro_astro_type_script_index_0_lang.Bx7sjjYZ.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/ygam/Documents/WORKS/Enterprise/PreResearch/Astro + Partytown/src/components/Header.astro?astro&type=script&index=0&lang.ts","function s(){const t=document.getElementById(\"mobile-menu-button\"),e=document.getElementById(\"mobile-menu\"),n=document.getElementById(\"menu-open-icon\"),d=document.getElementById(\"menu-close-icon\");t&&e&&(t.addEventListener(\"click\",i=>{i.preventDefault();const o=e.classList.contains(\"hidden\");e.classList.toggle(\"hidden\"),t.setAttribute(\"aria-expanded\",o?\"true\":\"false\"),n&&d&&(n.classList.toggle(\"hidden\"),d.classList.toggle(\"hidden\"))}),e.querySelectorAll(\"a\").forEach(i=>{i.addEventListener(\"click\",()=>{e.classList.add(\"hidden\"),t.setAttribute(\"aria-expanded\",\"false\"),n&&d&&(n.classList.remove(\"hidden\"),d.classList.add(\"hidden\"))})}))}document.readyState===\"loading\"?document.addEventListener(\"DOMContentLoaded\",s):s();"]],"assets":["/_astro/about.Bl9lZe3h.css","/backhoe.webp","/case1.webp","/case2.webp","/case3.webp","/company-bg.webp","/company-building.svg","/factory-panoramic.svg","/factory.webp","/favicon.svg","/google9f1b396ff80fe0a5.html","/main-product.svg","/news1.webp","/news2.webp","/news3.webp","/news4.webp","/product1.svg","/product2.svg","/product3.svg","/skid-main.webp","/skid1.webp","/skid2.webp","/skid3.webp","/skid4.webp","/skid5.webp","/team1.webp","/team2.webp","/team3.webp","/telescopic.webp","/_astro/SmartMenu.astro_astro_type_script_index_0_lang.Bx7sjjYZ.js","/images/mobile-banner-fast.svg","/images/mobile-banner-micro.svg","/images/mobile-banner-optimized.svg","/images/mobile-banner-tiny.svg","/images/mobile-banner-ultra-fast.svg","/images/mobile-banner-ultra-tiny.svg","/images/mobile-banner.svg","/about/index.html","/contact/index.html","/products/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"QVnRw5wW/FwALiJ+8t++oiuD9wBbfx/60l0Q3sLFeEo="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
