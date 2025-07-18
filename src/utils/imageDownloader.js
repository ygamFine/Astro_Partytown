/**
 * 图片下载工具 - 在构建时将Strapi图片下载到本地
 */

// 图片下载和本地化工具

// 只在服务端运行时导入Node.js模块
let fs, path, fileURLToPath;
let IMAGE_CACHE_DIR;

if (typeof window === 'undefined') {
  // 服务端代码
  fs = await import('fs');
  path = await import('path');
  const url = await import('url');
  fileURLToPath = url.fileURLToPath;
  
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  IMAGE_CACHE_DIR = path.join(process.cwd(), 'public/images/strapi');
}

/**
 * 生成图片文件名
 */
function generateImageFileName(originalUrl) {
  const url = new URL(originalUrl, 'http://47.251.126.80');
  const pathname = url.pathname;
  const ext = path.extname(pathname) || '.jpg';
  const hash = Buffer.from(pathname).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  return `${hash}${ext}`;
}

// 确保缓存目录存在
function ensureCacheDir() {
  if (typeof window !== 'undefined') return; // 客户端不执行
  
  if (!fs.existsSync(IMAGE_CACHE_DIR)) {
    fs.mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
  }
}

// 下载单个图片
export async function downloadImage(imageUrl, fileName) {
  if (typeof window !== 'undefined') {
    // 客户端返回原始URL
    return imageUrl;
  }

  try {
    ensureCacheDir();
    
    // 检查文件是否已存在
    const localPath = path.join(IMAGE_CACHE_DIR, fileName);
    if (fs.existsSync(localPath)) {
      return `/images/strapi/${fileName}`;
    }

    // 下载图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn(`Failed to download image: ${imageUrl}`);
      return imageUrl;
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(localPath, Buffer.from(buffer));
    
    console.log(`Downloaded image: ${fileName}`);
    return `/images/strapi/${fileName}`;
  } catch (error) {
    console.error(`Error downloading image ${imageUrl}:`, error);
    return imageUrl;
  }
}

/**
 * 批量下载图片
 */
export async function downloadImages(imageUrls) {
  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }

  const downloadPromises = imageUrls.map(url => downloadImage(url));
  const results = await Promise.allSettled(downloadPromises);
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error('下载图片失败:', result.reason);
      return '/images/placeholder.webp';
    }
  });
}

// 处理产品图片数组
export async function processProductImages(images) {
  if (typeof window !== 'undefined') {
    // 客户端直接返回原始数据
    return images;
  }

  if (!images || !Array.isArray(images)) {
    return images;
  }

  const processedImages = [];
  for (const image of images) {
    if (image && image.url) {
      const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;
      const localUrl = await downloadImage(image.url, fileName);
      processedImages.push({
        ...image,
        url: localUrl,
        localUrl: localUrl
      });
    }
  }
  return processedImages;
}

// 处理单个图片
export async function processSingleImage(image) {
  if (typeof window !== 'undefined') {
    // 客户端直接返回原始数据
    return image;
  }

  if (!image || !image.url) {
    return image;
  }

  const fileName = `single_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;
  const localUrl = await downloadImage(image.url, fileName);
  
  return {
    ...image,
    url: localUrl,
    localUrl: localUrl
  };
} 

// 处理新闻图片
export async function processNewsImages(images) {
  if (typeof window !== 'undefined') {
    // 客户端直接返回原始数据
    return images;
  }

  if (!images || !Array.isArray(images)) {
    return images;
  }

  const processedImages = [];
  for (const image of images) {
    if (image && image.url) {
      const fileName = `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;
      const localUrl = await downloadImage(image.url, fileName);
      processedImages.push({
        ...image,
        url: localUrl,
        localUrl: localUrl
      });
    }
  }
  return processedImages;
}

// 处理案例图片
export async function processCaseImages(images) {
  if (typeof window !== 'undefined') {
    // 客户端直接返回原始数据
    return images;
  }

  if (!images || !Array.isArray(images)) {
    return images;
  }

  const processedImages = [];
  for (const image of images) {
    if (image && image.url) {
      const fileName = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;
      const localUrl = await downloadImage(image.url, fileName);
      processedImages.push({
        ...image,
        url: localUrl,
        localUrl: localUrl
      });
    }
  }
  return processedImages;
} 