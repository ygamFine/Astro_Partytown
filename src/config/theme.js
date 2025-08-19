/**
 * 网站主题配置文件
 * 使用变量形式控制网站的可视化文档宽度
 * 
 * 配置说明：
 * - mode: 'follow' | 'dynamic' | 'mixed' - 控制模式
 * - followMode: 所有页面跟随首页宽度
 * - dynamicMode: 每个页面独立设置宽度
 * - mixedMode: 混合模式，优先使用页面特定配置
 */

export const themeConfig = {
  // 全站限制配置
  restrictions: {
    // 语言限制配置
    languageRestrictions: {
      'zh-CN': {
        hidePricing: true,        // 中文站隐藏价格相关
        hideShoppingCart: true,   // 中文站隐藏购物车相关
        hideAddToCart: true       // 中文站隐藏加入购物车按钮
      },
      'zh-Hant': {
        hidePricing: true,        // 繁体中文站隐藏价格相关
        hideShoppingCart: true,   // 繁体中文站隐藏购物车相关
        hideAddToCart: true       // 繁体中文站隐藏加入购物车按钮
      }
    }
  },
  
  // 语言选择器配置
  languageSelector: {
    showLanguageSelector: true,   // 显示语言选择器
    hideWhenSingleLanguage: true, // 只有一种语言时隐藏
    enabledLanguages: [] // 将从 Strapi API 动态获取
  },
  
  // 网站可视化文档宽度动态配置
  layout: {
    // 控制模式：'follow' | 'dynamic' | 'mixed'
    mode: 'follow',

    // 1、内页跟随首页宽度变化
    followHomePage: {
      defaultWidth: '1600px', // 默认宽度
      minWidth: '320px', // 最小宽度
      maxWidth: '1920px', // 最大宽度
      responsive: {
        mobile: '100%',
        tablet: '90%',
        desktop: '1200px',
        wide: '1400px'
      }
    },

    // 2、可动态单独设置宽度
    dynamicWidth: {
      pages: {
        // 首页宽度配置
        home: {
          width: '1600px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 产品页宽度配置
        products: {
          width: '1200px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 新闻页宽度配置
        news: {
          width: '1200px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 案例页宽度配置
        cases: {
          width: '1200px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 关于我们页宽度配置
        about: {
          width: '1200px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 联系我们页宽度配置
        contact: {
          width: '1200px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 搜索页宽度配置
        search: {
          width: '1200px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 自定义页面宽度配置
        dynamic: {
          width: '1400px',
          maxWidth: '100%',
          minWidth: '320px'
        }
      },
      // 动态宽度设置方法
      setPageWidth: (pageName, width) => {
        if (themeConfig.layout.dynamicWidth.pages[pageName]) {
          themeConfig.layout.dynamicWidth.pages[pageName].width = width;
        }
      },
      // 获取页面宽度
      getPageWidth: (pageName) => {
        const mode = themeConfig.layout.mode;

        // 动态模式：优先使用页面特定配置
        if (mode === 'dynamic' && themeConfig.layout.dynamicWidth.pages[pageName]) {
          return themeConfig.layout.dynamicWidth.pages[pageName].width;
        }

        // 跟随模式：使用首页宽度
        if (mode === 'follow') {
          return themeConfig.layout.dynamicWidth.pages.home?.width || themeConfig.layout.followHomePage.defaultWidth;
        }

        // 混合模式：优先使用页面特定配置，没有则使用首页宽度
        if (mode === 'mixed') {
          if (themeConfig.layout.dynamicWidth.pages[pageName]) {
            return themeConfig.layout.dynamicWidth.pages[pageName].width;
          }
          return themeConfig.layout.dynamicWidth.pages.home?.width || themeConfig.layout.followHomePage.defaultWidth;
        }

        // 默认使用 followHomePage 的默认宽度
        return themeConfig.layout.followHomePage.defaultWidth;
      }
    },

    // 侧边栏展示模式配置
    sidebar: {
      // 是否显示侧边栏
      visible: true,

      // 展示模式：'current-top' | 'fixed-order' | 'current-only'
      // current-top: 当前菜单项置顶显示
      // fixed-order: 固定菜单顺序（产品、案例、新闻）
      // current-only: 只显示当前模块菜单
      displayMode: 'current-top',

      // 固定顺序模式下的菜单顺序
      fixedOrder: ['products', 'cases', 'news', 'about'],

      // 是否显示菜单项数量
      showCount: true,

      // 是否默认展开当前菜单
      autoExpandCurrent: true,

      // 是否允许同时展开多个菜单
      allowMultipleOpen: false
    },

    // 列表描述内容配置
    listDescription: {
      // 展示模式：'below-title' | 'above-pagination'
      // below-title: H1标题下方
      // above-pagination: 列表底部，分页上方
      displayMode: 'above-pagination'
    },

    // 产品卡片主题配置
    productCard: {
      // 默认显示内容
      defaultDisplay: {
        showName: true,        // 显示名称
        showPrice: false,      // 显示价格（可配置）
        showDescription: false // 显示描述
      },

      // 鼠标悬停弹出层配置
      hoverOverlay: {
        showName: true,           // 显示名称
        showDescription: true,    // 显示描述
        showContactButton: true,  // 显示立即联系按钮
        showAdvantages: true,    // 显示优势（可配置）
        showAddToCart: true      // 显示加入购物车按钮（可配置）
      },

      // 卡片样式配置
      style: {
        borderRadius: '8px',      // 圆角
        shadow: 'lg',             // 阴影
        hoverEffect: 'lift',      // 悬停效果：'lift' | 'scale' | 'none'
        imageAspectRatio: '16/9'  // 图片宽高比
      }
    },

    // 联系按钮配置
    contactButtons: {
      showContactNow: true,    // 显示立即联系按钮
      showDownloadPdf: true,   // 显示下载PDF按钮
      showEmail: true,         // 显示邮件按钮
      showTelephone: true,     // 显示电话按钮
      showWhatsapp: true,      // 显示WhatsApp按钮

      // PDF文件配置
      pdfConfig: {
        url: '/catalog.pdf',    // PDF文件路径
        filename: 'catalog.pdf' // 下载文件名
      }
    },

    // 产品详情页配置
    productDetail: {
      // 右侧栏配置
      sidebar: {
        showSidebar: true,           // 显示右侧栏
        showRecommendedProducts: true, // 显示推荐产品
        showRelatedNews: true,       // 显示相关新闻
        showContactForm: true        // 显示联系表单
      },

      // 价格和购物车配置
      pricing: {
        showPricing: true,           // 显示价格区域
        showMultiplePrices: true,    // 显示多币种价格
        showAddToCart: true,         // 显示加入购物车按钮

        // 价格配置
        priceConfig: {
          currency: 'USD',           // 默认货币符号

          // 多币种配置
          currencies: {
            USD: { symbol: '$', rate: 1.0 },
            CNY: { symbol: '¥', rate: 7.16 },
            EUR: { symbol: '€', rate: 0.92 },
            GBP: { symbol: '£', rate: 0.82 },
            JPY: { symbol: '¥', rate: 143.20 },
            KRW: { symbol: '₩', rate: 1314.00 },
            INR: { symbol: '₹', rate: 82.00 },
            CAD: { symbol: 'CA$', rate: 1.35 },
            AUD: { symbol: 'A$', rate: 1.50 },
            NZD: { symbol: 'NZ$', rate: 1.50 }
          }
        }
      }
    },

    // Banner配置
    banner: {
      // 全局banner配置
      useGlobalImage: true, // 是否使用全局共用图片
      globalBackgroundImage: '/images/banner.webp', // 全局共用的banner图片
      useGlobalHeight: true, // 是否使用全局统一高度
      globalHeight: 'large', // 全局统一的高度 'small' | 'medium' | 'large'
      
      // 默认背景图片（当不使用全局图片时）
              defaultBackgroundImage: '/images/banner.webp',
      
      // 默认高度配置（当不使用全局高度时）
      defaultHeight: 'small', // 'small' | 'medium' | 'large'
      
      // 高度配置映射
      heightClasses: {
        small: 'py-20',
        medium: 'py-42',
        large: 'py-64'
      },
      
      // 页面特定配置
      pages: {
        // 首页banner配置
        home: {
          backgroundImage: '/images/banner.webp',
          height: 'large',
          background: 'image'
        },
        // 产品页banner配置
        products: {
          backgroundImage: '/images/banner.webp',
          height: 'medium',
          background: 'image'
        },
        // 新闻页banner配置
        news: {
          backgroundImage: '/images/banner.webp',
          height: 'medium',
          background: 'image'
        },
        // 案例页banner配置
        cases: {
          backgroundImage: '/images/banner.webp',
          height: 'medium',
          background: 'image'
        },
        // 关于我们页banner配置
        about: {
          backgroundImage: '/images/banner.webp',
          height: 'medium',
          background: 'image'
        },
        // 联系我们页banner配置
        contact: {
          backgroundImage: '/images/banner.webp',
          height: 'medium',
          background: 'image'
        },
        // 搜索页banner配置
        search: {
          backgroundImage: '/images/banner.webp',
          height: 'medium',
          background: 'image'
        },
        // 自定义页面banner配置
        dynamic: {
          backgroundImage: '/images/banner.webp',
          height: 'medium',
          background: 'image'
        }
      },
      
      // 获取页面banner配置的方法
      getPageBannerConfig: (pageType) => {
        const mode = themeConfig.layout.mode;
        
        // 获取基础配置
        let baseConfig = {
          backgroundImage: themeConfig.layout.banner.defaultBackgroundImage,
          height: themeConfig.layout.banner.defaultHeight,
          background: 'image'
        };
        
        // 如果启用全局图片，则使用全局图片
        if (themeConfig.layout.banner.useGlobalImage) {
          baseConfig.backgroundImage = themeConfig.layout.banner.globalBackgroundImage;
        }
        
        // 如果启用全局高度，则使用全局高度
        if (themeConfig.layout.banner.useGlobalHeight) {
          baseConfig.height = themeConfig.layout.banner.globalHeight;
        }
        
        // 动态模式：优先使用页面特定配置，但保留全局图片和高度设置
        if (mode === 'dynamic' && themeConfig.layout.banner.pages[pageType]) {
          const pageConfig = themeConfig.layout.banner.pages[pageType];
          return {
            ...pageConfig,
            backgroundImage: themeConfig.layout.banner.useGlobalImage 
              ? themeConfig.layout.banner.globalBackgroundImage 
              : pageConfig.backgroundImage,
            height: themeConfig.layout.banner.useGlobalHeight
              ? themeConfig.layout.banner.globalHeight
              : pageConfig.height
          };
        }
        
        // 跟随模式：使用首页配置，但保留全局图片和高度设置
        if (mode === 'follow') {
          const homeConfig = themeConfig.layout.banner.pages.home || baseConfig;
          return {
            ...homeConfig,
            backgroundImage: themeConfig.layout.banner.useGlobalImage 
              ? themeConfig.layout.banner.globalBackgroundImage 
              : homeConfig.backgroundImage,
            height: themeConfig.layout.banner.useGlobalHeight
              ? themeConfig.layout.banner.globalHeight
              : homeConfig.height
          };
        }
        
        // 混合模式：优先使用页面特定配置，没有则使用首页配置，但保留全局图片和高度设置
        if (mode === 'mixed') {
          if (themeConfig.layout.banner.pages[pageType]) {
            const pageConfig = themeConfig.layout.banner.pages[pageType];
            return {
              ...pageConfig,
              backgroundImage: themeConfig.layout.banner.useGlobalImage 
                ? themeConfig.layout.banner.globalBackgroundImage 
                : pageConfig.backgroundImage,
              height: themeConfig.layout.banner.useGlobalHeight
                ? themeConfig.layout.banner.globalHeight
                : pageConfig.height
            };
          }
          const homeConfig = themeConfig.layout.banner.pages.home || baseConfig;
          return {
            ...homeConfig,
            backgroundImage: themeConfig.layout.banner.useGlobalImage 
              ? themeConfig.layout.banner.globalBackgroundImage 
              : homeConfig.backgroundImage,
            height: themeConfig.layout.banner.useGlobalHeight
              ? themeConfig.layout.banner.globalHeight
              : homeConfig.height
          };
        }
        
                // 默认配置
        return baseConfig;
      }
    }
  }
};

// 导出配置
export default themeConfig; 