/**
 * 主题配置示例文件
 * 展示不同的配置场景和使用方法（变量形式）
 */

// 示例1：所有页面跟随首页宽度
export const followHomePageExample = {
  layout: {
    mode: 'follow', // 跟随模式
    followHomePage: {
      defaultWidth: '1600px'
    },
    dynamicWidth: {
      pages: {
        home: { width: '1600px' } // 首页宽度，其他页面会跟随这个宽度
      }
    }
  }
};

// 示例2：每个页面独立设置宽度
export const dynamicWidthExample = {
  layout: {
    mode: 'dynamic', // 动态模式
    followHomePage: {
      defaultWidth: '1200px'
    },
    dynamicWidth: {
      pages: {
        home: { width: '1200px' },
        products: { width: '1600px' },
        news: { width: '1000px' },
        cases: { width: '1600px' },
        about: { width: '1000px' },
        contact: { width: '1000px' },
        search: { width: '1200px' }
      }
    }
  }
};

// 示例3：混合模式
export const mixedModeExample = {
  layout: {
    mode: 'mixed', // 混合模式
    followHomePage: {
      defaultWidth: '1400px'
    },
    dynamicWidth: {
      pages: {
        home: { width: '1200px' },
        products: { width: '1600px' }, // 这个会优先使用
        news: { width: '1000px' },     // 这个会优先使用
        // 其他页面会使用 followHomePage.defaultWidth
      }
    }
  }
};

/**
 * 使用说明：
 * 
 * 1. 跟随模式 (mode: 'follow')：
 *    - 所有页面都使用首页的宽度
 *    - 适合统一布局的网站
 * 
 * 2. 动态模式 (mode: 'dynamic')：
 *    - 每个页面使用自己的宽度配置
 *    - 适合需要不同页面不同布局的网站
 * 
 * 3. 混合模式 (mode: 'mixed')：
 *    - 有配置的页面使用自己的宽度
 *    - 没有配置的页面使用首页宽度
 *    - 适合大部分页面统一，少数页面特殊的网站
 * 
 * 修改配置：
 * - 只需要修改 mode 变量即可切换模式
 * - 不需要设置多个 enabled 变量
 */ 