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
          width: '1000px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 新闻页宽度配置
        news: {
          width: '1000px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 案例页宽度配置
        cases: {
          width: '1000px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 关于我们页宽度配置
        about: {
          width: '1000px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 联系我们页宽度配置
        contact: {
          width: '1000px',
          maxWidth: '100%',
          minWidth: '320px'
        },
        // 搜索页宽度配置
        search: {
          width: '1000px',
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
      displayMode: 'current-only',
      
      // 固定顺序模式下的菜单顺序
      fixedOrder: ['products', 'cases', 'news'],
      
      // 是否显示菜单项数量
      showCount: true,
      
      // 是否默认展开当前菜单
      autoExpandCurrent: true,
      
      // 是否允许同时展开多个菜单
      allowMultipleOpen: false
    }
  }
};

// 导出配置
export default themeConfig; 