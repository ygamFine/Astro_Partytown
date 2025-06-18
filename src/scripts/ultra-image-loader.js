/**
 * 极致图片加载优化系统
 * 目标：首屏图片 < 100ms 显示，整体 LCP < 0.9s 
 */

class UltraImageLoader {
    constructor() {
        this.loadedImages = new Set();
        this.imageQueue = [];
        this.isLoading = false;
        this.performanceData = {
            startTime: performance.now(),
            firstImageTime: null,
            allImagesTime: null
        };
    }

    // 初始化图片加载系统
    init() {
        this.setupCriticalImages();
        this.setupProgressiveLoading();
        this.setupLazyLoading();
        this.setupPerformanceMonitoring();
    }

    // 设置关键图片立即加载
    setupCriticalImages() {
        // 移动端Banner极致优化
        const mobileBannerContainer = document.querySelector('.mobile-banner-ultra');
        if (mobileBannerContainer) {
            this.loadMobileBannerProgressive(mobileBannerContainer);
        }

        // 关键产品图片
        const criticalImages = document.querySelectorAll('.critical-path-image');
        criticalImages.forEach(img => this.loadImageUltraFast(img));
    }

    // 移动端Banner渐进式加载
    loadMobileBannerProgressive(container) {
        // 微型版本已经通过CSS立即显示
        this.recordPerformance('firstImage');

        // 2. 预加载优化版本
        setTimeout(() => {
            const optimizedBanner = new Image();
            optimizedBanner.onload = () => {
                const progressiveDiv = document.createElement('div');
                progressiveDiv.className = 'mobile-banner-progressive';
                progressiveDiv.style.backgroundImage = `url(${optimizedBanner.src})`;
                progressiveDiv.style.backgroundSize = 'cover';
                progressiveDiv.style.backgroundPosition = 'center';
                container.appendChild(progressiveDiv);
                
                // 渐显优化版本
                requestAnimationFrame(() => {
                    progressiveDiv.classList.add('loaded');
                });

                // 3. 延迟加载完整版本
                setTimeout(() => {
                    this.loadFullBanner(container);
                }, 300);
            };
            optimizedBanner.src = '/images/mobile-banner-optimized.svg';
        }, 100);
    }

    // 加载完整版Banner
    loadFullBanner(container) {
        const fullBanner = new Image();
        fullBanner.onload = () => {
            const fullDiv = document.createElement('img');
            fullDiv.src = fullBanner.src;
            fullDiv.className = 'mobile-banner';
            fullDiv.style.position = 'absolute';
            fullDiv.style.top = '0';
            fullDiv.style.left = '0';
            fullDiv.style.width = '100%';
            fullDiv.style.height = '100%';
            fullDiv.style.opacity = '0';
            fullDiv.style.zIndex = '4';
            container.appendChild(fullDiv);

            requestAnimationFrame(() => {
                fullDiv.style.opacity = '1';
                fullDiv.style.transition = 'opacity 0.3s ease';
                this.recordPerformance('fullImage');
            });
        };
        fullBanner.src = '/images/mobile-banner-fast.svg';
    }

    // 极速图片加载
    loadImageUltraFast(imgElement) {
        if (this.loadedImages.has(imgElement.src)) return;

        const startTime = performance.now();
        
        // 立即显示骨架屏
        imgElement.classList.add('skeleton-image');
        
        // 预加载图片
        const preloadImage = new Image();
        preloadImage.onload = () => {
            imgElement.src = preloadImage.src;
            imgElement.classList.remove('skeleton-image');
            imgElement.classList.add('loaded');
            this.loadedImages.add(imgElement.src);
            
            const loadTime = performance.now() - startTime;
            console.log(`Image loaded in ${loadTime.toFixed(2)}ms:`, imgElement.src);
        };
        
        preloadImage.onerror = () => {
            imgElement.classList.remove('skeleton-image');
            imgElement.alt = '图片加载失败';
        };
        
        preloadImage.src = imgElement.dataset.src || imgElement.src;
    }

    // 设置渐进式加载
    setupProgressiveLoading() {
        const progressiveImages = document.querySelectorAll('.progressive-image');
        progressiveImages.forEach(container => {
            this.loadProgressiveImage(container);
        });
    }

    loadProgressiveImage(container) {
        const img = container.querySelector('img');
        const placeholder = container.querySelector('.progressive-image-placeholder');
        
        if (!img) return;

        const preloadImg = new Image();
        preloadImg.onload = () => {
            img.src = preloadImg.src;
            container.classList.add('loaded');
            
            setTimeout(() => {
                if (placeholder) {
                    placeholder.remove();
                }
            }, 300);
        };
        
        preloadImg.src = img.dataset.src || img.src;
    }

    // 设置懒加载
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            this.setupScrollListener();
        }
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImageUltraFast(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        const lazyImages = document.querySelectorAll('.lazy-image');
        lazyImages.forEach(img => observer.observe(img));
    }

    setupScrollListener() {
        let throttleTimer = null;
        
        const checkImages = () => {
            const lazyImages = document.querySelectorAll('.lazy-image:not(.loaded)');
            lazyImages.forEach(img => {
                if (this.isInViewport(img)) {
                    this.loadImageUltraFast(img);
                }
            });
        };

        window.addEventListener('scroll', () => {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                checkImages();
                throttleTimer = null;
            }, 100);
        });

        checkImages(); // 初始检查
    }

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // 性能监控
    setupPerformanceMonitoring() {
        // 监控LCP
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime.toFixed(2) + 'ms');
                    
                    if (lastEntry.startTime > 900) {
                        console.warn('LCP超过900ms，需要进一步优化');
                    }
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.log('LCP monitoring not supported');
            }
        }

        // 监控图片加载完成
        window.addEventListener('load', () => {
            this.recordPerformance('allImages');
            this.reportPerformance();
        });
    }

    recordPerformance(type) {
        const now = performance.now();
        switch (type) {
            case 'firstImage':
                this.performanceData.firstImageTime = now - this.performanceData.startTime;
                break;
            case 'allImages':
                this.performanceData.allImagesTime = now - this.performanceData.startTime;
                break;
        }
    }

    reportPerformance() {
        console.group('🚀 Ultra Image Loader Performance Report');
        console.log('First Image:', this.performanceData.firstImageTime?.toFixed(2) + 'ms');
        console.log('All Images:', this.performanceData.allImagesTime?.toFixed(2) + 'ms');
        console.log('Images Loaded:', this.loadedImages.size);
        console.groupEnd();
    }

    // WebP支持检测
    detectWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        
        try {
            const dataURL = canvas.toDataURL('image/webp');
            if (dataURL.indexOf('data:image/webp') === 0) {
                document.documentElement.classList.add('webp');
                return true;
            }
        } catch (e) {
            // WebP not supported
        }
        
        document.documentElement.classList.add('no-webp');
        return false;
    }

    // 预加载关键图片
    preloadCriticalImages() {
        const criticalImages = [
            '/images/mobile-banner-micro.svg',
            '/images/mobile-banner-optimized.svg',
            '/product1.svg',
            '/product2.svg',
            '/product3.svg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // 清理内存
    cleanup() {
        this.loadedImages.clear();
        this.imageQueue.length = 0;
    }
}

// 立即初始化
const ultraImageLoader = new UltraImageLoader();

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ultraImageLoader.detectWebPSupport();
        ultraImageLoader.preloadCriticalImages();
        ultraImageLoader.init();
    });
} else {
    ultraImageLoader.detectWebPSupport();
    ultraImageLoader.preloadCriticalImages();
    ultraImageLoader.init();
}

// 页面卸载前清理
window.addEventListener('beforeunload', () => {
    ultraImageLoader.cleanup();
});

// 导出供其他脚本使用
window.UltraImageLoader = ultraImageLoader; 