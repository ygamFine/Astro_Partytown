// Swiper 按需加载工具
// 只导入需要的模块，减小打包体积

let swiperInstance: any = null;
let loadingPromise: Promise<any> | null = null;

/**
 * 懒加载 Swiper
 * 使用单例模式，确保只加载一次
 */
export async function loadSwiper() {
  if (swiperInstance) {
    return swiperInstance;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = import('swiper').then(({ default: Swiper, Navigation, Pagination, Autoplay }) => {
    swiperInstance = { Swiper, Navigation, Pagination, Autoplay };
    return swiperInstance;
  });

  return loadingPromise;
}

/**
 * 注入 Swiper 基础样式
 * 只包含必需的核心样式
 */
export function injectSwiperStyles() {
  if (typeof document === 'undefined') return;
  
  const styleId = 'swiper-custom-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .swiper{margin-left:auto;margin-right:auto;position:relative;overflow:hidden;list-style:none;padding:0;z-index:1;display:block}
    .swiper-wrapper{position:relative;width:100%;height:100%;z-index:1;display:flex;transition-property:transform;transition-timing-function:var(--swiper-wrapper-transition-timing-function,initial);box-sizing:content-box}
    .swiper-slide{flex-shrink:0;width:100%;height:100%;position:relative;transition-property:transform;display:block}
    .swiper-button-next,.swiper-button-prev{position:absolute;top:var(--swiper-navigation-top-offset,50%);width:calc(var(--swiper-navigation-size)/ 44 * 27);height:var(--swiper-navigation-size);margin-top:calc(0px - (var(--swiper-navigation-size)/ 2));z-index:10;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--swiper-navigation-color,var(--swiper-theme-color))}
    .swiper-button-next:after,.swiper-button-prev:after{font-family:swiper-icons;font-size:var(--swiper-navigation-size);text-transform:none!important;letter-spacing:0;font-variant:normal;line-height:1}
    .swiper-button-prev{left:var(--swiper-navigation-sides-offset,10px);right:auto}
    .swiper-button-next{right:var(--swiper-navigation-sides-offset,10px);left:auto}
    .swiper-pagination{position:absolute;text-align:center;transition:.3s opacity;transform:translate3d(0,0,0);z-index:10}
    .swiper-pagination-bullet{width:var(--swiper-pagination-bullet-width,var(--swiper-pagination-bullet-size,8px));height:var(--swiper-pagination-bullet-height,var(--swiper-pagination-bullet-size,8px));display:inline-block;border-radius:50%;background:var(--swiper-pagination-bullet-inactive-color,#000);opacity:var(--swiper-pagination-bullet-inactive-opacity,.2)}
    .swiper-pagination-bullet-active{opacity:var(--swiper-pagination-bullet-opacity,1);background:var(--swiper-pagination-bullet-active-color,var(--swiper-theme-color))}
  `;
  document.head.appendChild(style);
}

