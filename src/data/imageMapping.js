/**
 * 图片映射文件 - 将字符串路径映射到导入的图片
 * 用于支持动态图片的SSG优化
 */

// 导入所有图片资源
import logoImage from '../assets/images/logo.png.webp';
import bannerImage from '../assets/images/banner.webp';
import banner222Image from '../assets/images/banner222.webp';
import banner3Image from '../assets/images/banner3.webp';
import bannerMobileImage from '../assets/images/banner-mobile.webp';
import banner222MobileImage from '../assets/images/banner222-mobile.webp';
import shoujiBannerUltraImage from '../assets/images/shouji-banner1-ultra.webp';
import shoujiBannerMobileImage from '../assets/images/shouji-banner1-mobile.webp';

import skid1Image from '../assets/images/skid1.webp';
import skid2Image from '../assets/images/skid2.webp';
import skid3Image from '../assets/images/skid3.webp';
import skid4Image from '../assets/images/skid4.webp';
import skid5Image from '../assets/images/skid5.webp';
import skidMainImage from '../assets/images/skid-main.webp';
import skid1_400Image from '../assets/images/skid1-400.webp';

import backhoeImage from '../assets/images/backhoe.webp';
import backhoe_400Image from '../assets/images/backhoe-400.webp';

import telescopicImage from '../assets/images/telescopic.webp';
import telescopic_400Image from '../assets/images/telescopic-400.webp';

import product1Image from '../assets/images/product1.webp';
import product2Image from '../assets/images/product2.webp';

import case1Image from '../assets/images/case1.webp';
import case2Image from '../assets/images/case2.webp';
import case3Image from '../assets/images/case3.webp';

import factoryImage from '../assets/images/factory.webp';
import companyBuildingImage from '../assets/images/company-building.svg';

// 图片映射表
export const imageMap = {
  // Logo
  '/images/logo.png.webp': logoImage,
  '/logo.png.webp': logoImage,
  
  // Banner图片
  '/images/banner.webp': bannerImage,
  '/banner.webp': bannerImage,
  '/images/banner222.webp': banner222Image,
  '/banner222.webp': banner222Image,
  '/images/banner3.webp': banner3Image,
  '/banner3.webp': banner3Image,
  '/images/banner-mobile.webp': bannerMobileImage,
  '/banner-mobile.webp': bannerMobileImage,
  '/images/banner222-mobile.webp': banner222MobileImage,
  '/banner222-mobile.webp': banner222MobileImage,
  '/images/shouji-banner1-ultra.webp': shoujiBannerUltraImage,
  '/shouji-banner1-ultra.webp': shoujiBannerUltraImage,
  '/images/shouji-banner1-mobile.webp': shoujiBannerMobileImage,
  '/shouji-banner1-mobile.webp': shoujiBannerMobileImage,
  
  // 滑移装载机图片
  '/images/skid1.webp': skid1Image,
  '/skid1.webp': skid1Image,
  '/images/skid2.webp': skid2Image,
  '/skid2.webp': skid2Image,
  '/images/skid3.webp': skid3Image,
  '/skid3.webp': skid3Image,
  '/images/skid4.webp': skid4Image,
  '/skid4.webp': skid4Image,
  '/images/skid5.webp': skid5Image,
  '/skid5.webp': skid5Image,
  '/images/skid-main.webp': skidMainImage,
  '/skid-main.webp': skidMainImage,
  '/images/skid1-400.webp': skid1_400Image,
  '/skid1-400.webp': skid1_400Image,
  
  // 挖掘机图片
  '/images/backhoe.webp': backhoeImage,
  '/backhoe.webp': backhoeImage,
  '/images/backhoe-400.webp': backhoe_400Image,
  '/backhoe-400.webp': backhoe_400Image,
  
  // 伸缩臂图片
  '/images/telescopic.webp': telescopicImage,
  '/telescopic.webp': telescopicImage,
  '/images/telescopic-400.webp': telescopic_400Image,
  '/telescopic-400.webp': telescopic_400Image,
  
  // 产品图片
  '/images/product1.webp': product1Image,
  '/product1.webp': product1Image,
  '/images/product2.webp': product2Image,
  '/product2.webp': product2Image,
  
  // 案例图片
  '/images/case1.webp': case1Image,
  '/case1.webp': case1Image,
  '/images/case2.webp': case2Image,
  '/case2.webp': case2Image,
  '/images/case3.webp': case3Image,
  '/case3.webp': case3Image,
  
  // 其他图片
  '/images/factory.webp': factoryImage,
  '/factory.webp': factoryImage,
  '/images/company-building.svg': companyBuildingImage,
  '/company-building.svg': companyBuildingImage,
};

/**
 * 获取优化的图片
 * @param {string} path - 图片路径
 * @returns {Object|null} 优化的图片对象或null
 */
export function getOptimizedImage(path) {
  return imageMap[path] || null;
}

/**
 * 检查图片是否可以被优化
 * @param {string} path - 图片路径
 * @returns {boolean} 是否可以优化
 */
export function isOptimizable(path) {
  return path in imageMap;
}

/**
 * 获取所有可优化的图片路径
 * @returns {string[]} 可优化的图片路径数组
 */
export function getOptimizablePaths() {
  return Object.keys(imageMap);
}

/**
 * 批量获取优化的图片
 * @param {string[]} paths - 图片路径数组
 * @returns {Object} 路径到优化图片的映射
 */
export function getOptimizedImages(paths) {
  const result = {};
  paths.forEach(path => {
    const optimized = getOptimizedImage(path);
    if (optimized) {
      result[path] = optimized;
    }
  });
  return result;
}

/**
 * 获取图片的默认尺寸
 * @param {string} path - 图片路径
 * @returns {Object} 默认尺寸 {width, height}
 */
export function getImageDimensions(path) {
  const dimensions = {
    // Logo
    '/images/logo.png.webp': { width: 200, height: 60 },
    '/logo.png.webp': { width: 200, height: 60 },
    
    // Banner图片
    '/images/banner.webp': { width: 1920, height: 600 },
    '/banner.webp': { width: 1920, height: 600 },
    '/images/banner222.webp': { width: 1920, height: 600 },
    '/banner222.webp': { width: 1920, height: 600 },
    '/images/banner3.webp': { width: 1920, height: 600 },
    '/banner3.webp': { width: 1920, height: 600 },
    '/images/banner-mobile.webp': { width: 768, height: 400 },
    '/banner-mobile.webp': { width: 768, height: 400 },
    '/images/banner222-mobile.webp': { width: 768, height: 400 },
    '/banner222-mobile.webp': { width: 768, height: 400 },
    '/images/shouji-banner1-ultra.webp': { width: 1920, height: 800 },
    '/shouji-banner1-ultra.webp': { width: 1920, height: 800 },
    '/images/shouji-banner1-mobile.webp': { width: 768, height: 600 },
    '/shouji-banner1-mobile.webp': { width: 768, height: 600 },
    
    // 产品图片
    '/images/skid1.webp': { width: 600, height: 400 },
    '/skid1.webp': { width: 600, height: 400 },
    '/images/skid2.webp': { width: 600, height: 400 },
    '/skid2.webp': { width: 600, height: 400 },
    '/images/skid3.webp': { width: 600, height: 400 },
    '/skid3.webp': { width: 600, height: 400 },
    '/images/skid4.webp': { width: 600, height: 400 },
    '/skid4.webp': { width: 600, height: 400 },
    '/images/skid5.webp': { width: 600, height: 400 },
    '/skid5.webp': { width: 600, height: 400 },
    '/images/skid-main.webp': { width: 800, height: 600 },
    '/skid-main.webp': { width: 800, height: 600 },
    '/images/skid1-400.webp': { width: 400, height: 300 },
    '/skid1-400.webp': { width: 400, height: 300 },
    
    // 挖掘机图片
    '/images/backhoe.webp': { width: 600, height: 400 },
    '/backhoe.webp': { width: 600, height: 400 },
    '/images/backhoe-400.webp': { width: 400, height: 300 },
    '/backhoe-400.webp': { width: 400, height: 300 },
    
    // 伸缩臂图片
    '/images/telescopic.webp': { width: 600, height: 400 },
    '/telescopic.webp': { width: 600, height: 400 },
    '/images/telescopic-400.webp': { width: 400, height: 300 },
    '/telescopic-400.webp': { width: 400, height: 300 },
    
    // 产品图片
    '/images/product1.webp': { width: 400, height: 300 },
    '/product1.webp': { width: 400, height: 300 },
    '/images/product2.webp': { width: 400, height: 300 },
    '/product2.webp': { width: 400, height: 300 },
    
    // 案例图片
    '/images/case1.webp': { width: 400, height: 300 },
    '/case1.webp': { width: 400, height: 300 },
    '/images/case2.webp': { width: 400, height: 300 },
    '/case2.webp': { width: 400, height: 300 },
    '/images/case3.webp': { width: 400, height: 300 },
    '/case3.webp': { width: 400, height: 300 },
    
    // 其他图片
    '/images/factory.webp': { width: 800, height: 600 },
    '/factory.webp': { width: 800, height: 600 },
    '/images/company-building.svg': { width: 600, height: 400 },
    '/company-building.svg': { width: 600, height: 400 },
  };
  
  return dimensions[path] || { width: 600, height: 400 };
} 