/**
 * Strapi 5 API 集成 - SSG模式直接访问
 * 构建时直接从API获取数据，图片自动下载到本地
 */

// 统一复用轻客户端的 HTTP 能力，避免重复请求代码
import { STRAPI_STATIC_URL, STRAPI_TOKEN, fetchJson, fetchAllPaginated } from './strapiClient.js';
// 使用公共图片处理工具
import { 
  loadImageMappingWithCreate, 
  processImageWithMapping, 
  processImageArray, 
  processSingleImage 
} from './imageUtils.js';

// 验证环境变量
if (!STRAPI_STATIC_URL || !STRAPI_TOKEN) {
  console.error('❌ 缺少必要的环境变量:');
  console.error('   STRAPI_STATIC_URL:', STRAPI_STATIC_URL ? '已设置' : '未设置');
  console.error('   STRAPI_API_TOKEN:', STRAPI_TOKEN ? '已设置' : '未设置');
  throw new Error('缺少必要的 Strapi 环境变量配置');
}



/**
 * 获取菜单数据 (SSG模式，构建时调用)
 */
export async function getMenus(locale = 'en') {
  try {
    const data = await fetchJson(`${STRAPI_STATIC_URL}/api/menu-manages?locale=${locale}&populate=*&sort=sort:ASC`);
    console.log('主菜单数据',data);
    // 转换为标准格式，支持国际化字段
    const menus = data.data?.map(item => ({
      name: item.name || item.attributes?.name,
      path: item.path || item.attributes?.path,
      locale: item.locale || item.attributes?.locale,
      publishedAt: item.publishedAt || item.attributes?.publishedAt,
      // 支持多语言子菜单
      children: item.children || item.attributes?.children || []
    })) || [];

    return menus;

  } catch (error) {
    return []
  }
}

/**
 * 获取产品列表 (SSG模式，构建时调用)
 */
export async function getProducts(locale = 'en') {
  // 兼容：支持 options 对象形式
  const isOptionsObject = locale && typeof locale === 'object';
  const options = isOptionsObject ? locale : { locale };
  const {
    locale: optLocale = 'en',
    paginate = 'page', // 'page' | 'all'
    page = 1,
    pageSize = 24,
    mode = 'shaped', // 'raw' | 'shaped'
    mapImages = true
  } = options;

  // 构建基础 URL（集合接口）
  const baseUrl = `${STRAPI_STATIC_URL}/api/products?locale=${optLocale}&populate=*`;

  if (mode === 'raw') {
    if (paginate === 'all') {
      return await fetchAllPaginated(baseUrl);
    } else {
      const url = `${baseUrl}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      return await fetchJson(url).catch(() => ({ data: [] }));
    }
  }

  try {
    // shaped 模式
    const json = (paginate === 'all')
      ? await fetchAllPaginated(baseUrl)
      : await fetchJson(`${baseUrl}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`);

    const products = json.data?.map(item => ({
      id: item.id,
      slug: item.slug,
      name: item.Title,
      category: item.cate?.name || item.category,
      image: item.imgs || ['/images/placeholder.webp'],
      price: item.price,
      excerpt: item.info?.[0]?.content || item.excerpt,
      specs: item.specs || [],
      features: item.features || [],
      gallery: [],
      locale: item.locale,
      publishedAt: item.publishedAt
    })) || [];

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理所有产品的图片，使用缓存的图片
    const processedProducts = products.map(product => ({
      ...product,
      image: processImageArray(product.image, imageMapping, mapImages)
    }));


    return processedProducts;

  } catch (error) {
    console.error('获取产品列表失败:', error);
    // 如果API调用失败，返回空数组
    return [];
  }
}

/**
 * 获取单个产品详情 (SSG模式，构建时调用)
 */
export async function getProduct(slugOrId, locale = 'en') {
  try {
    // 只获取指定语言的数据，不回退到其他语言
    // 仅当传入的是 number 类型时才按 ID 查询；字符串一律按 slug 查询（即使是纯数字字符串）
    const isNumericId = (typeof slugOrId === 'number');
    const url = isNumericId
      ? `${STRAPI_STATIC_URL}/api/product-manages/${slugOrId}?locale=${locale}&populate=*`
      : `${STRAPI_STATIC_URL}/api/product-manages?filters[slug][$eq]=${slugOrId}&locale=${locale}&populate=*`;
    const data = await fetchJson(url);

    // 适配两种响应：集合查询或单条查询
    const item = Array.isArray(data?.data) ? data.data[0] : data?.data;
    if (!item) {
      return null;
    }

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理图片，使用缓存的图片映射
    const processedImages = processImageArray(item.imgs, imageMapping, true);
    
    // 转换为标准格式
    return {
      id: item.id,
      slug: item.slug,
      name: item.Title,
      category: item.cate?.name || item.category,
      image: processedImages,
      price: item.price,
      excerpt: item.info?.[0]?.content || item.excerpt,
      info: item.info || [], // 保留完整的 info 字段用于富文本显示
      specs: item.specs || [],
      features: item.features || [],
      gallery: [],
      locale: item.locale,
      publishedAt: item.publishedAt
    };

  } catch (error) {
    console.error('获取产品详情失败:', error);
    return null;
  }
}

/**
 * 获取新闻列表 (SSG模式，构建时调用)
 */
export async function getNews(locale = 'en') {
  // 兼容：支持 options 对象形式
  const isOptionsObject = locale && typeof locale === 'object';
  const options = isOptionsObject ? locale : { locale };
  const {
    locale: optLocale = 'en',
    paginate = 'page',
    page = 1,
    pageSize = 24,
    mode = 'shaped',
    mapImages = true
  } = options;

  const baseUrl = `${STRAPI_STATIC_URL}/api/news?locale=${optLocale}&populate=*`;

  if (mode === 'raw') {
    if (paginate === 'all') {
      return await fetchAllPaginated(baseUrl);
    } else {
      const url = `${baseUrl}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      return await fetchJson(url).catch(() => ({ data: [] }));
    }
  }

  try {
    const json = (paginate === 'all')
      ? await fetchAllPaginated(baseUrl)
      : await fetchJson(`${baseUrl}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`);

    const news = json.data?.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      image: item.zhanshitu && item.zhanshitu.length > 0 ? item.zhanshitu[0] : null,
      date: item.publishedAt || item.createdAt,
      author: item.author,
      category: item.category,
      tags: item.tags || [],
      locale: item.locale,
      publishedAt: item.publishedAt
    })) || [];

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理所有新闻的图片，使用缓存的图片
    const processedNews = news.map(newsItem => ({
      ...newsItem,
      image: processSingleImage(newsItem.image, imageMapping, mapImages)
    }));


    return processedNews;

  } catch (error) {
    console.error('获取新闻列表失败:', error);
    // 如果API调用失败，返回空数组
    return [];
  }
}

/**
 * 获取单个新闻详情 (SSG模式，构建时调用)
 */
export async function getNewsById(id, locale = 'en') {
  try {
    const data = await fetchJson(`${STRAPI_STATIC_URL}/api/news/${id}?locale=${locale}&populate=*`);

    // 如果没有找到数据，直接返回 null
    if (!data.data) {
  
      return null;
    }

    const item = data.data;

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理图片，使用缓存的图片
    const originalImage = item.zhanshitu && item.zhanshitu.length > 0 ? item.zhanshitu[0] : null;
    const processedImage = processSingleImage(originalImage, imageMapping, true);
    
    // 转换为标准格式
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      image: processedImage,
      date: item.publishedAt || item.createdAt,
      author: item.author,
      category: item.category,
      tags: item.tags || [],
      locale: item.locale,
      publishedAt: item.publishedAt
    };

  } catch (error) {
    console.error('获取新闻详情失败:', error);
    return null;
  }
}

/**
 * 获取案例列表 (SSG模式，构建时调用)
 */
export async function getCases(locale = 'en') {
  // 兼容：支持 options 对象形式
  const isOptionsObject = locale && typeof locale === 'object';
  const options = isOptionsObject ? locale : { locale };
  const {
    locale: optLocale = 'en',
    paginate = 'page',
    page = 1,
    pageSize = 24,
    mode = 'shaped',
    mapImages = true
  } = options;

  const baseUrl = `${STRAPI_STATIC_URL}/api/case?locale=${optLocale}&populate=*`;

  if (mode === 'raw') {
    if (paginate === 'all') {
      return await fetchAllPaginated(baseUrl);
    } else {
      const url = `${baseUrl}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
      return await fetchJson(url).catch(() => ({ data: [] }));
    }
  }

  try {
    const json = (paginate === 'all')
      ? await fetchAllPaginated(baseUrl)
      : await fetchJson(`${baseUrl}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`).catch(() => null);
    if (!json) return [];
    const cases = json.data?.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      client: item.client,
      image: item.image && item.image.length > 0 ? item.image[0] : null,
      excerpt: item.excerpt,
      category: item.category,
      date: item.publishedAt || item.createdAt,
      results: item.results || [],
      content: item.content,
      industry: item.industry,
      location: item.location,
      completionDate: item.completionDate,
      equipmentUsed: item.equipmentUsed,
      projectDuration: item.projectDuration,
      locale: item.locale,
      publishedAt: item.publishedAt
    })) || [];

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理所有案例的图片，使用缓存的图片
    const processedCases = cases.map(caseItem => ({
      ...caseItem,
      image: processSingleImage(caseItem.image, imageMapping, mapImages)
    }));


    return processedCases;

  } catch (error) {
    console.error('获取案例列表失败:', error);
    // 如果API调用失败，返回空数组
    return [];
  }
}

/**
 * 获取单个案例详情 (SSG模式，构建时调用)
 */
export async function getCase(id, locale = 'en') {
  try {
    const data = await fetchJson(`${STRAPI_STATIC_URL}/api/case/${id}?locale=${locale}&populate=*`).catch(() => null);
    if (!data) return null;

    // 如果没有找到数据，直接返回 null
    if (!data.data) {
      
      return null;
    }

    const item = data.data;

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 处理图片，使用缓存的图片
    const originalImage = item.image && item.image.length > 0 ? item.image[0] : null;
    const processedImage = processSingleImage(originalImage, imageMapping, true);
    
    // 转换为标准格式
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      client: item.client,
      image: processedImage,
      excerpt: item.excerpt,
      category: item.category,
      date: item.publishedAt || item.createdAt,
      results: item.results || [],
      content: item.content,
      industry: item.industry,
      location: item.location,
      completionDate: item.completionDate,
      equipmentUsed: item.equipmentUsed,
      projectDuration: item.projectDuration,
      locale: item.locale,
      publishedAt: item.publishedAt
    };

  } catch (error) {
    console.error('获取案例详情失败:', error);
    return null;
  }
}


/**
 * 获取移动端底部菜单数据 (SSG模式，构建时调用)
 */
export async function getMobileBottomMenu(locale = 'en') {
  // 按语言缓存（进程内共享），并发去重
  globalThis.__mobileBottomMenuCacheMap = globalThis.__mobileBottomMenuCacheMap || new Map();
  globalThis.__mobileBottomMenuPromiseMap = globalThis.__mobileBottomMenuPromiseMap || new Map();

  if (globalThis.__mobileBottomMenuCacheMap.has(locale)) {
    return globalThis.__mobileBottomMenuCacheMap.get(locale);
  }
  if (globalThis.__mobileBottomMenuPromiseMap.has(locale)) {
    return await globalThis.__mobileBottomMenuPromiseMap.get(locale);
  }

  const fetchPromise = (async () => {
    try {
      // 若后端支持本地化，带上 locale 查询参数；不支持也不影响
      const apiUrl = `${STRAPI_STATIC_URL}/api/shoujiduandibucaidan?populate=all&locale=${locale}`;
      const data = await fetchJson(apiUrl);
      
      // 加载图片映射（用于图标缓存处理）
      const imageMapping = await loadImageMappingWithCreate();
      
      // 提取菜单项数据
      const menuItems = data.data?.shoujiduandibucaidan || [];
      
      // 转换为标准格式
      const processedMenuItems = menuItems.map(item => {
        const fieldLiebiao = item.field_liebiao || '';
        const uniqueId = fieldLiebiao.includes('|') ? fieldLiebiao.split('|')[0].toLowerCase().trim() : fieldLiebiao.toLowerCase().trim();
        
        // 深层提取并处理自定义图标（使用图片缓存系统）
        const getProcessedCustomIcon = (iconData, imageMapping) => {
          if (!iconData) {
            return null;
          }
          
          // 尝试多种可能的路径结构提取原始图标数据
          let extractedIconData = null;
          
          if (iconData?.media) {
            // 标准Strapi媒体结构: icon.media
            extractedIconData = iconData.media;
          } else if (iconData?.url) {
            // 直接URL结构: icon.url
            extractedIconData = iconData;
          } else if (iconData?.image) {
            // 备选结构: icon.image
            extractedIconData = iconData.image;
          } else if (typeof iconData === 'string') {
            // 字符串URL
            extractedIconData = { url: iconData };
          }
          
          if (!extractedIconData) {
            return null;
          }
          
          // 使用公共图片映射系统处理图标
          const processedIconUrl = processImageWithMapping(extractedIconData, imageMapping);
          
          // 直接返回映射后的路径，让前端组件使用 processImagesForAstro 处理
          if (processedIconUrl) {
            return processedIconUrl;
          }
          
          // 如果映射失败且原始URL存在，尝试构造完整的Strapi URL
          if (!processedIconUrl && extractedIconData?.url) {
            const originalUrl = extractedIconData.url;
            
            // 如果是相对路径，构造完整的Strapi URL
            if (originalUrl.startsWith('/uploads/')) {
              const fullUrl = `${STRAPI_STATIC_URL}${originalUrl}`;
              return fullUrl;
            }
            
            return originalUrl;
          }
          
          return processedIconUrl;
        };
        
        const customIconUrl = getProcessedCustomIcon(item.icon, imageMapping);
        
        return {
          id: item.id,
          content: item.field_neirong,
          // 链接优先级：field_zidingyilianjie > Inline_address > 默认值
          customLink: item.field_zidingyilianjie || item.Inline_address,
          inlineAddress: item.Inline_address,
          externalLink: item.field_zidingyilianjie,
          // 根据数据结构判断菜单类型，而不是依赖多语言的名称
          type: getMenuType(item),
          // 图标处理：优先使用深层提取的自定义图标，没有则使用field_liebiao对应的字体图标
          icon: customIconUrl || getDefaultMenuIcon(item),
          // 新增：区分是图片图标还是字体图标
          iconType: customIconUrl ? 'image' : 'font'
        };
      });

      globalThis.__mobileBottomMenuCacheMap.set(locale, processedMenuItems);
      return processedMenuItems;

    } catch (error) {
      console.error('获取移动端底部菜单失败:', error);
      // 失败也缓存为空数组，避免构建期重复请求
      globalThis.__mobileBottomMenuCacheMap.set(locale, []);
      return [];
    } finally {
      globalThis.__mobileBottomMenuPromiseMap.delete(locale);
    }
  })();

  globalThis.__mobileBottomMenuPromiseMap.set(locale, fetchPromise);
  return await fetchPromise;
}

/**
 * 根据菜单项数据结构判断菜单类型
 * @param {Object} item - 菜单项数据
 */
function getMenuType(item) {
  // 优先根据 field_liebiao 字段的唯一标识判断类型
  const fieldLiebiao = item.field_liebiao || '';
  const uniqueId = fieldLiebiao.includes('|') ? fieldLiebiao.split('|')[0].toLowerCase().trim() : fieldLiebiao.toLowerCase().trim();
  
  // 根据唯一标识映射菜单类型
  const typeMapping = {
    'home': 'home',
    'product': 'product', 
    'phone': 'phone',
    'whatsapp': 'whatsapp',
    'email': 'email',
    'news': 'news',
    'aboutus': 'about',
    'contactus': 'contact',
    'vr': 'vr',
    'videos': 'videos'
  };
  
  return typeMapping[uniqueId] || 'custom';
}

/**
 * 根据菜单项数据结构获取默认图标
 * @param {Object} item - 菜单项数据
 */
function getDefaultMenuIcon(item) {
  // 根据 field_liebiao 字段的唯一标识判断图标
  const fieldLiebiao = item.field_liebiao || '';
  const uniqueId = fieldLiebiao.includes('|') ? fieldLiebiao.split('|')[0].toLowerCase().trim() : fieldLiebiao.toLowerCase().trim();
  
  // 根据唯一标识映射图标（确保每个菜单项使用独特图标）
  const iconMapping = {
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
  };
  
  
  
  return iconMapping[uniqueId] || 'circle';
}



/**
 * 处理单个Banner项目的辅助函数
 */
function processBannerItem(banner, imageMapping, type, index) {
  if (!banner) return null;
  
  // 优先级1: field_bannershipin (权重最高)
  let shipinOriginal = banner?.field_bannershipin?.media?.url ?? banner?.field_bannershipin?.url ?? null;
  
  // 优先级2: 桌面端图片
  let desktopOriginal = banner?.field_tupian?.media?.url ?? banner?.field_tupian?.url ?? null;
  
  // 优先级3: 移动端图片
  let mobileOriginal = banner?.field_shouji?.media?.url ?? banner?.field_shouji?.url ?? null;

  // 兼容数组结构（若字段为数组取第一项）
  if (!shipinOriginal && Array.isArray(banner?.field_bannershipin)) {
    const firstS = banner?.field_bannershipin?.find?.(Boolean);
    shipinOriginal = firstS?.media?.url ?? firstS?.url ?? null;
  }
  if (!desktopOriginal && Array.isArray(banner?.field_tupian)) {
    const first = banner?.field_tupian?.find?.(Boolean);
    desktopOriginal = first?.media?.url ?? first?.url ?? null;
  }
  if (!mobileOriginal && Array.isArray(banner?.field_shouji)) {
    const firstM = banner?.field_shouji?.find?.(Boolean);
    mobileOriginal = firstM?.media?.url ?? firstM?.url ?? null;
  }

  // 使用公共图片映射函数，支持 '/uploads/' 或完整 URL
  const imageShipin = shipinOriginal
    ? (processImageWithMapping({ url: shipinOriginal }, imageMapping) ?? shipinOriginal)
    : null;
  const imageDesktop = desktopOriginal
    ? (processImageWithMapping({ url: desktopOriginal }, imageMapping) ?? desktopOriginal)
    : '/images/placeholder.webp';
  const imageMobile = mobileOriginal
    ? (processImageWithMapping({ url: mobileOriginal }, imageMapping) ?? mobileOriginal)
    : imageDesktop;
  
  return {
    id: banner?.id || `${type}-${index}`,
    name: banner?.field_mingcheng ?? `Banner${banner?.id ?? index}`,
    description: banner?.field_miaoshu ?? '',
    link: banner?.field_lianjiezhi ?? null,
    image: imageDesktop, // 兼容旧字段：默认返回桌面图
    mobileImage: imageMobile, // 新增：移动端专用图片
    shipin: imageShipin, // 新增：视频字段（优先级最高）
    alt: banner?.field_tupian?.alt ?? banner?.field_mingcheng ?? `Banner${banner?.id ?? index}`,
    type: type, // 新增：标识banner类型 'homepage' 或 'common'
    source: type === 'homepage' ? 'field_shouyebanner' : 'field_tongyongbanner' // 新增：标识数据来源字段
  };
}

/**
 * 获取Banner数据 (SSG模式，构建时调用)
 * 从用户提供的API获取Banner轮播图数据，支持首页banner和通用banner
 * @param {string} filterType - 可选过滤类型：'homepage', 'common', 或 undefined(返回全部)
 */
export async function getBannerData(filterType = undefined) {
  try {
    const apiUrl = `${STRAPI_STATIC_URL}/api/banner-setting?populate=all`;
    
    // 检查必要的环境变量
    if (!STRAPI_STATIC_URL) {
      console.warn('[getBannerData] STRAPI_STATIC_URL 未配置，返回空数据');
      return [];
    }
    
    const data = await fetchJson(apiUrl);
    
    if (!data || !data.data) {
      console.warn('[getBannerData] Banner数据为空或网络请求失败');
      return [];
    }

    // 加载图片映射
    const imageMapping = await loadImageMappingWithCreate();

    // 合并处理首页Banner和通用Banner数据
    const shouyeBanners = data?.data?.field_shouyebanner ?? [];
    const tongyongBanners = data?.data?.field_tongyongbanner ?? [];
    
    const allBanners = [...shouyeBanners, ...tongyongBanners];
    
    if (allBanners.length === 0) {
      console.warn('没有找到任何Banner数据（首页或通用）');
      return [];
    }

    // 处理Banner数据，同时标记来源
    const banners = [];
    
    // 处理首页banners
    shouyeBanners.forEach((banner, index) => {
      const processed = processBannerItem(banner, imageMapping, 'homepage', index);
      if (processed) banners.push(processed);
    });
    
    // 处理通用banners
    tongyongBanners.forEach((banner, index) => {
      const processed = processBannerItem(banner, imageMapping, 'common', index);
      if (processed) banners.push(processed);
    });

    // 根据过滤类型返回结果
    const filteredBanners = filterType ? banners.filter(banner => banner.type === filterType) : banners;

    return filteredBanners;

  } catch (error) {
    console.error('获取Banner数据失败:', error);
    return [];
  }
}

/**
 * 获取通用Banner数据 (专门用于PageBanner组件)
 * 直接调用 getBannerData 并过滤通用banner类型
 */
export async function getCommonBannerData() {
  try {
    // 直接使用过滤参数获取通用banner
    const commonBanners = await getBannerData('common');
    
    // 调试信息已移除

    return commonBanners;

  } catch (error) {
    console.error('获取通用Banner数据失败:', error);
    return [];
  }
}

/**
 * 获取首页数据 (SSG模式，构建时调用)
 * 从用户提供的API获取完整的首页内容数据
 */
export async function getHomepageContent() {
  try {
    const apiUrl = `${STRAPI_STATIC_URL}/api/homepage-content?populate=*`;
    const data = await fetchJson(apiUrl);
    
    if (!data.data) {
      console.warn('首页数据为空');
      return null;
    }

    // 提取并处理首页数据
    const homepageData = data.data;
    
    return {
      // 产品展示区域数据
      productShowcase: {
        title: homepageData?.product_showcase?.title ?? '',
        description: homepageData?.product_showcase?.description ?? ''
      },
      
      // 公司介绍数据
      companyIntroduction: {
        title: homepageData?.company_introduction?.title ?? '',
        introduction: homepageData?.company_introduction?.introduction ?? '',
        stats: {
          incorporation: homepageData?.company_introduction?.incorporation ?? '',
          floorSpace: homepageData?.company_introduction?.floorSpace ?? '',
          exportingCountry: homepageData?.company_introduction?.exportingCountry ?? ''
        },
        buttonText: homepageData?.company_introduction?.button_text ?? ''
      },
      
      // 热门推荐产品数据
      hotRecommendedProducts: {
        title: homepageData?.hot_recommended_products?.title ?? '',
        description: homepageData?.hot_recommended_products?.description ?? ''
      },
      
      // 联系我们/客户需求数据
      contactUs: {
        title: homepageData?.contact_us?.title ?? '',
        description: homepageData?.contact_us?.description ?? '',
        buttonText: homepageData?.contact_us?.button_text ?? '',
        panoramicTitle: homepageData?.contact_us?.panoramic_title ?? '',
        panoramicIntroduction: homepageData?.contact_us?.panoramic_introduction ?? '',
        panoramicUrl: homepageData?.contact_us?.panoramic_url ?? null
      },
      
      // 客户案例数据
      customerCases: homepageData.customer_cases || null,
      
      // 新闻中心数据
      newsCenter: homepageData.news_center || null,
      
      // 首页页脚数据
      homepageFooter: homepageData.homepage_footer || null
    };

  } catch (error) {
    console.error('获取首页数据失败:', error);
    return null;
  }
}

/**
 * 从 Strapi API 获取支持的语言列表
 * - 仅请求标准接口 /api/i18n/locales
 * - 不做硬编码回退，失败时返回空数组
 */
export async function getSupportedLanguages() {
  try {
    const res = await fetch(`${STRAPI_STATIC_URL}/api/i18n/locales`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    // Strapi 标准返回通常是数组；若为 { data: [...] } 亦做兼容
    const rawList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    const languages = rawList
      .map((item) => {
        const code = item?.code || item?.attributes?.code || item?.id || item?.locale || null;
        const name = item?.name || item?.attributes?.name || code || '';
        return code ? { code, name } : null;
      })
      .filter(Boolean);

    // 去重并按 code 排序
    const map = new Map();
    for (const lang of languages) {
      if (!map.has(lang.code)) map.set(lang.code, lang);
    }

    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  } catch (err) {
    return [];
  }
}



