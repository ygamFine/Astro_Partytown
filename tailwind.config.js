/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#dc2626', // 主品牌色
          700: '#b91c1c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out',
        'slide-up': 'slideUp 1s cubic-bezier(0.4,0,0.2,1)',
        'slide-in-left': 'slideInLeft 1s cubic-bezier(0.4,0,0.2,1)',
        'slide-in-right': 'slideInRight 1s cubic-bezier(0.4,0,0.2,1)',
        'bounce-in': 'bounceIn 1.2s cubic-bezier(0.68,-0.55,0.265,1.55)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(40px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-40px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: 0, transform: 'translateX(40px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { opacity: 0, transform: 'scale(0.3)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },

      },
    },
  },
  plugins: [],
  // 性能优化配置
  corePlugins: {
    preflight: true, // 保留重置样式
    container: true,
    // 禁用不常用的插件以减少CSS大小
    accessibility: false,
    backgroundOpacity: false,
    borderOpacity: false,
    boxShadowColor: false,
    divideOpacity: false,
    placeholderOpacity: false,
    ringOpacity: false,
    textOpacity: false,
    // 禁用过时的功能
    float: false,
    clear: false,
  },
}

