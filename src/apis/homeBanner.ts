// 统一复用轻客户端的 HTTP 能力，避免重复请求代码
import { STRAPI_STATIC_URL, STRAPI_TOKEN, fetchJson } from '@lib/strapiClient.js';

// 验证环境变量
if (!STRAPI_STATIC_URL || !STRAPI_TOKEN) {
  throw new Error('缺少必要的 Strapi 环境变量配置');
}

type BannerFilterType = 'homepage' | 'common';

interface ProcessedBannerItem {
  id: string | number;
  name: string;
  description: string;
  link: string | null;
  desktopImage: string;
  mobileImage: string;
  shipin: string | null;
  alt: string;
  type: BannerFilterType;
  source: string;
  // 原始图片URL字段
  field_tupian_url: string | null;
  field_shouji_url: string | null;
  field_bannershipin_url: string | null;
}

/**
 * 处理单个Banner项目，提取图片URL字段
 */
function processBannerItem(banner: any, type: BannerFilterType, index: number): ProcessedBannerItem {
  // 提取图片URL字段
  let field_tupian_url: string | null = null;
  let field_shouji_url: string | null = null;
  let field_bannershipin_url: string | null = null;

  // 处理 field_tupian.media.url (桌面端图片)
  if (Array.isArray(banner?.field_tupian)) {
    const firstTupian = banner.field_tupian.find(Boolean);
    const rawUrl = firstTupian?.media?.url ?? firstTupian?.url ?? null;
    field_tupian_url = rawUrl ? `${STRAPI_STATIC_URL}${rawUrl}` : null;
  } else if (banner?.field_tupian?.media?.url) {
    field_tupian_url = `${STRAPI_STATIC_URL}${banner.field_tupian.media.url}`;
  }

  // 处理 field_shouji.media.url (移动端图片)
  if (Array.isArray(banner?.field_shouji)) {
    const firstShouji = banner.field_shouji.find(Boolean);
    const rawUrl = firstShouji?.media?.url ?? firstShouji?.url ?? null;
    field_shouji_url = rawUrl ? `${STRAPI_STATIC_URL}${rawUrl}` : null;
  } else if (banner?.field_shouji?.media?.url) {
    field_shouji_url = `${STRAPI_STATIC_URL}${banner.field_shouji.media.url}`;
  }

  // 处理 field_bannershipin.media.url (视频)
  if (Array.isArray(banner?.field_bannershipin)) {
    const firstShipin = banner.field_bannershipin.find(Boolean);
    const rawUrl = firstShipin?.media?.url ?? firstShipin?.url ?? null;
    field_bannershipin_url = rawUrl ? `${STRAPI_STATIC_URL}${rawUrl}` : null;
  } else if (banner?.field_bannershipin?.media?.url) {
    field_bannershipin_url = `${STRAPI_STATIC_URL}${banner.field_bannershipin.media.url}`;
  }

  // 移动端优先使用视频，如果没有视频则使用移动端图片，最后使用桌面端图片
  const mobileImage = field_bannershipin_url || field_shouji_url || field_tupian_url || '/images/placeholder.webp';
  
  // PC端优先使用视频，如果没有视频则使用桌面端图片
  const desktopImage = field_bannershipin_url || field_tupian_url || '/images/placeholder.webp';
  
  const shipin = field_bannershipin_url;

  return {
    id: banner?.id || `${type}-${index}`,
    name: banner?.field_mingcheng ?? `Banner${banner?.id ?? index}`,
    description: banner?.field_miaoshu ?? '',
    link: banner?.field_lianjiezhi ?? null,
    desktopImage,
    mobileImage,
    shipin,
    alt: banner?.field_tupian?.alt ?? banner?.field_mingcheng ?? `Banner${banner?.id ?? index}`,
    type,
    source: type === 'homepage' ? 'field_shouyebanner' : 'field_tongyongbanner',
    // 原始图片URL字段
    field_tupian_url,
    field_shouji_url,
    field_bannershipin_url
  };
}

/**
 * 获取Banner数据 (SSG模式，构建时调用)
 * 从用户提供的API获取Banner轮播图数据，支持首页banner和通用banner
 * @param {string} filterType - 可选过滤类型：'homepage', 'common', 或 undefined(返回全部)
 */
export async function getBannerData(filterType: BannerFilterType | undefined): Promise<ProcessedBannerItem[]> {
    try {
    
      const data = await fetchJson(`${STRAPI_STATIC_URL}/api/banner-setting?populate=all`);
      
      if (!data || !data.data) {
        return [];
      }
  
      // 合并处理首页Banner和通用Banner数据
      const shouyeBanners = data?.data?.field_shouyebanner ?? [];
      const tongyongBanners = data?.data?.field_tongyongbanner ?? [];
      
      const allBanners = [...shouyeBanners, ...tongyongBanners];
      
      if (allBanners.length === 0) {
        return [];
      }

      // 处理Banner数据，提取图片URL字段
      const processedBanners: ProcessedBannerItem[] = [];
      
      // 处理首页banners
      shouyeBanners.forEach((banner: any, index: number) => {
        const processed = processBannerItem(banner, 'homepage', index);
        processedBanners.push(processed);
      });
      
      // 处理通用banners
      tongyongBanners.forEach((banner: any, index: number) => {
        const processed = processBannerItem(banner, 'common', index);
        processedBanners.push(processed);
      });

      // 根据过滤类型返回结果
      switch (filterType) {
        case 'homepage':
          return processedBanners.filter(banner => banner.type === 'homepage');
        case 'common':
          return processedBanners.filter(banner => banner.type === 'common');
        default:
          return processedBanners;
      }
  
    } catch (error) {
      console.error('获取Banner数据失败:', error);
      return [];
    }
  }