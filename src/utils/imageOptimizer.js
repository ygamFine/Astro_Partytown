/**
 * 图片优化工具库 - 用于动态图片的SSG优化
 */

// 图片尺寸配置
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 200 },
  medium: { width: 600, height: 400 },
  large: { width: 1200, height: 800 },
  banner: { width: 1920, height: 600 }
};

// 图片格式配置
export const IMAGE_FORMATS = ['webp', 'avif'];

// 响应式断点
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440
};

/**
 * 生成响应式图片属性
 * @param {string} src - 图片源路径
 * @param {Object} options - 配置选项
 * @returns {Object} 优化后的图片属性
 */
export function optimizeImage(src, options = {}) {
  const {
    alt = '',
    width = IMAGE_SIZES.medium.width,
    height = IMAGE_SIZES.medium.height,
    loading = 'lazy',
    decoding = 'async',
    sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    className = '',
    priority = false
  } = options;

  // 生成响应式srcset
  const srcset = generateSrcSet(src, width, height);
  
  // 生成优化的图片属性
  const optimizedProps = {
    src,
    alt,
    width,
    height,
    loading: priority ? 'eager' : loading,
    decoding,
    sizes,
    className: `optimized-image ${className}`.trim(),
    fetchpriority: priority ? 'high' : 'auto'
  };

  // 如果有srcset，添加到属性中
  if (srcset) {
    optimizedProps.srcset = srcset;
  }

  return optimizedProps;
}

/**
 * 生成响应式srcset
 * @param {string} src - 图片源路径
 * @param {number} baseWidth - 基础宽度
 * @param {number} baseHeight - 基础高度
 * @returns {string} srcset字符串
 */
function generateSrcSet(src, baseWidth, baseHeight) {
  const multipliers = [1, 1.5, 2, 3];
  const srcsetParts = [];

  multipliers.forEach(multiplier => {
    const width = Math.round(baseWidth * multiplier);
    const height = Math.round(baseHeight * multiplier);
    
    // 这里可以集成图片优化服务
    // 例如：Cloudinary, ImageKit, 或自建的图片优化服务
    const optimizedSrc = getOptimizedImageUrl(src, width, height);
    
    srcsetParts.push(`${optimizedSrc} ${multiplier}x`);
  });

  return srcsetParts.join(', ');
}

/**
 * 获取优化后的图片URL
 * @param {string} src - 原始图片路径
 * @param {number} width - 目标宽度
 * @param {number} height - 目标高度
 * @returns {string} 优化后的图片URL
 */
function getOptimizedImageUrl(src, width, height) {
  // 如果是本地图片，返回原始路径
  if (src.startsWith('/') || src.startsWith('./')) {
    return src;
  }

  // 如果是外部图片，可以集成图片优化服务
  // 这里提供一个示例实现
  if (src.startsWith('http')) {
    // 示例：使用Cloudinary优化
    // return `https://res.cloudinary.com/your-cloud/image/fetch/w_${width},h_${height},f_auto,q_auto/${encodeURIComponent(src)}`;
    
    // 示例：使用ImageKit优化
    // return `https://ik.imagekit.io/your-account/tr:w-${width},h-${height},f-auto,q-auto/${encodeURIComponent(src)}`;
    
    // 暂时返回原始URL
    return src;
  }

  return src;
}

/**
 * 生成图片占位符
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {string} text - 占位符文本
 * @returns {string} 占位符URL
 */
export function generatePlaceholder(width, height, text = '') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = width;
  canvas.height = height;
  
  // 绘制背景
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);
  
  // 绘制文本
  if (text) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  }
  
  return canvas.toDataURL();
}

/**
 * 图片懒加载配置
 */
export const lazyLoadConfig = {
  rootMargin: '50px 0px',
  threshold: 0.1
};

/**
 * 预加载关键图片
 * @param {string[]} imageUrls - 需要预加载的图片URL数组
 */
export function preloadImages(imageUrls) {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.fetchpriority = 'high';
    document.head.appendChild(link);
  });
}

/**
 * 图片错误处理
 * @param {Event} event - 图片加载错误事件
 * @param {string} fallbackSrc - 备用图片路径
 */
export function handleImageError(event, fallbackSrc) {
  const img = event.target;
  if (img.src !== fallbackSrc) {
    img.src = fallbackSrc;
    img.onerror = null; // 防止无限循环
  }
}

/**
 * 图片加载完成处理
 * @param {HTMLImageElement} img - 图片元素
 * @param {Function} callback - 回调函数
 */
export function handleImageLoad(img, callback) {
  if (img.complete) {
    callback(img);
  } else {
    img.addEventListener('load', () => callback(img));
  }
}

/**
 * 生成WebP格式的图片URL
 * @param {string} src - 原始图片路径
 * @returns {string} WebP格式的图片URL
 */
export function getWebPUrl(src) {
  if (src.includes('?')) {
    return `${src}&format=webp`;
  }
  return `${src}?format=webp`;
}

/**
 * 检查浏览器是否支持WebP
 * @returns {Promise<boolean>}
 */
export function supportsWebP() {
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * 根据设备像素比优化图片
 * @param {string} src - 图片源
 * @param {number} baseWidth - 基础宽度
 * @returns {string} 优化后的图片URL
 */
export function getPixelRatioOptimizedUrl(src, baseWidth) {
  const pixelRatio = window.devicePixelRatio || 1;
  const targetWidth = Math.round(baseWidth * pixelRatio);
  
  return getOptimizedImageUrl(src, targetWidth, targetWidth * 0.75);
} 