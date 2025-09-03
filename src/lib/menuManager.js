/**
 * 菜单管理模块 - 统一管理所有菜单相关功能
 */

export class MenuManager {
  constructor() {
    this.currentLang = this.getCurrentLang();
    this.supportedLanguages = [];
    this.init();
  }

  /**
   * 初始化菜单管理器
   */
  init() {
    this.initLanguageSelector();
    this.initMenuSelection();
    this.setActiveMenuItem();
    this.initHeaderSearch();
    this.markMenuLoaded();
  }

  /**
   * 获取当前语言
   */
  getCurrentLang() {
    const currentPath = window.location.pathname;
    const pathLangMatch = currentPath.match(/^\/([a-z]{2}(-[A-Z]{2,4})?)(\/|$)/);
    let currentLang = pathLangMatch ? pathLangMatch[1] : null;
    
    if (!currentLang) {
      // 尝试从子域名获取语言，使用接口数据
      const hostname = window.location.hostname;
      const firstSubdomain = hostname.split('.')[0];
      
      // 如果有支持的语言列表，尝试匹配子域名
      if (this.supportedLanguages.length > 0) {
        const matchedLang = this.supportedLanguages.find(lang => 
          lang.code === firstSubdomain || 
          lang.code.startsWith(firstSubdomain + '-')
        );
        if (matchedLang) {
          currentLang = matchedLang.code;
        }
      }
      
      // 如果没有找到匹配的语言，使用默认语言
      if (!currentLang) {
        currentLang = this.supportedLanguages.length > 0 ? this.supportedLanguages[0].code : 'en';
      }
    }
    
    return currentLang;
  }

  /**
   * 初始化语言选择器
   */
  initLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    const languageDropdown = document.getElementById('language-dropdown');
    const languageArrow = document.getElementById('language-arrow');
    
    if (!languageSelector || !languageDropdown || !languageArrow) return;

    // 切换下拉菜单
    languageSelector.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleLanguageDropdown(languageDropdown, languageArrow);
    });

    // 语言选项点击事件
    this.initLanguageOptions(languageDropdown, languageArrow);

    // 点击外部关闭下拉菜单
    this.initClickOutsideHandler(languageSelector, languageDropdown, languageArrow);

    // 初始化语言选择器显示
    this.initLanguageSelectorDisplay();
  }

  /**
   * 切换语言下拉菜单
   */
  toggleLanguageDropdown(dropdown, arrow) {
    const isHidden = dropdown.classList.contains('hidden');
    
    if (isHidden) {
      dropdown.classList.remove('hidden');
      arrow.style.transform = 'rotate(180deg)';
    } else {
      dropdown.classList.add('hidden');
      arrow.style.transform = 'rotate(0deg)';
    }
  }

  /**
   * 初始化语言选项
   */
  initLanguageOptions(dropdown, arrow) {
    const languageOptions = document.querySelectorAll('.language-option');
    
    languageOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const selectedLang = option.getAttribute('data-lang');
        const selectedName = option.getAttribute('data-name');
        
        if (selectedLang && selectedName) {
          this.handleLanguageChange(selectedLang, selectedName);
        }
        
        // 关闭下拉菜单
        dropdown.classList.add('hidden');
        arrow.style.transform = 'rotate(0deg)';
      });
    });
  }

  /**
   * 处理语言切换
   */
  handleLanguageChange(selectedLang, selectedName) {
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDev) {
      // 本地开发：总是跳转到首页
      const newPath = `/${selectedLang}/`;
      window.open(newPath, '_blank');
    } else {
      // 生产环境：构建子域名URL，总是跳转到首页
      const subdomain = selectedLang;
      const currentDomain = window.location.hostname;
      const baseDomain = currentDomain.split('.').slice(-2).join('.');
      const newUrl = `https://${subdomain}.${baseDomain}`;
      window.open(newUrl, '_blank');
    }
  }

  /**
   * 初始化点击外部关闭处理
   */
  initClickOutsideHandler(selector, dropdown, arrow) {
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (target && !selector.contains(target) && !dropdown.contains(target)) {
        dropdown.classList.add('hidden');
        arrow.style.transform = 'rotate(0deg)';
      }
    });
  }

  /**
   * 初始化语言选择器显示
   */
  initLanguageSelectorDisplay() {
    const selectorText = document.getElementById('current-language-display');
    if (!selectorText) return;

    // 查找对应的语言选项
    const currentLangOption = document.querySelector(`[data-lang="${this.currentLang}"]`);
    
    if (currentLangOption) {
      const selectedName = currentLangOption.getAttribute('data-name');
      if (selectedName) {
        selectorText.textContent = selectedName;
      } else {
        selectorText.textContent = this.currentLang;
      }
    } else {
      selectorText.textContent = this.currentLang;
    }
    
    // 更新选中状态
    this.updateLanguageSelectionState();
  }

  /**
   * 更新语言选择状态
   */
  updateLanguageSelectionState() {
    document.querySelectorAll('.language-option').forEach(option => {
      option.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500');
    });
    
    const currentLangOption = document.querySelector(`[data-lang="${this.currentLang}"]`);
    if (currentLangOption) {
      currentLangOption.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500');
    }
  }

  /**
   * 初始化菜单选择
   */
  initMenuSelection() {
    const menuItems = document.querySelectorAll('.menu-item:not(.has-dropdown)');
    
    menuItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        this.updateActiveMenuItem(item);
      });
    });
  }

  /**
   * 更新菜单选中状态
   */
  updateActiveMenuItem(clickedItem) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    // 移除所有菜单项的active状态
    menuItems.forEach(menuItem => {
      menuItem.classList.remove('active');
    });
    
    // 为当前点击的菜单项添加active状态
    clickedItem.classList.add('active');
    
    // 储存选中状态到sessionStorage
    const href = clickedItem.getAttribute('href');
    if (href) {
      sessionStorage.setItem('activeMenuItem', href);
    }
  }

  /**
   * 设置当前页面菜单项为选中状态
   */
  setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu-item');
    
    // 检查是否已经有服务端渲染的选中状态
    const hasActiveItem = Array.from(menuItems).some(item => item.classList.contains('active'));
    
    if (!hasActiveItem) {
      // 如果没有预设的选中状态，进行客户端设置
      let foundMatch = false;
      
      menuItems.forEach(item => {
        const href = item.getAttribute('href') || item.getAttribute('data-path');
        if (href === currentPath || (currentPath === '/' && href === '/')) {
          item.classList.add('active');
          foundMatch = true;
        }
      });
      
      // 如果没有找到匹配项，默认选中第一个
      if (!foundMatch && menuItems.length > 0) {
        menuItems[0].classList.add('active');
      }
    }
    
    // 确保只有一个菜单项被选中
    this.ensureSingleActiveMenuItem();
  }

  /**
   * 确保只有一个菜单项被选中
   */
  ensureSingleActiveMenuItem() {
    const activeItems = document.querySelectorAll('.menu-item.active');
    if (activeItems.length > 1) {
      // 如果有多个选中项，只保留第一个
      for (let i = 1; i < activeItems.length; i++) {
        activeItems[i].classList.remove('active');
      }
    }
  }

  /**
   * 初始化头部搜索功能
   */
  initHeaderSearch() {
    const searchInput = document.getElementById('header-search-input');
    const searchButton = document.getElementById('header-search-button');
    
    if (!searchInput || !searchButton) return;
    
    // 回车键搜索
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.performSearch(searchInput.value.trim());
      }
    });
    
    // 点击搜索按钮
    searchButton.addEventListener('click', () => {
      this.performSearch(searchInput.value.trim());
    });
  }

  /**
   * 执行搜索
   */
  performSearch(query) {
    if (!query) return;
    
    const hostname = window.location.hostname;
    const pathLang = (window.location.pathname.split('/')[1] || '');
    
    let currentLang = pathLang;
    
    // 如果没有路径语言，尝试从子域名获取
    if (!currentLang) {
      const firstSubdomain = hostname.split('.')[0];
      
      // 使用接口数据匹配子域名
      if (this.supportedLanguages.length > 0) {
        const matchedLang = this.supportedLanguages.find(lang => 
          lang.code === firstSubdomain || 
          lang.code.startsWith(firstSubdomain + '-')
        );
        if (matchedLang) {
          currentLang = matchedLang.code;
        }
      }
      
      // 如果没有找到匹配的语言，使用默认语言
      if (!currentLang) {
        currentLang = this.supportedLanguages.length > 0 ? this.supportedLanguages[0].code : 'en';
      }
    }
    
    const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
    const searchBase = isDev ? `/${currentLang}/search` : `/search`;
    
    window.location.href = `${searchBase}?q=${encodeURIComponent(query)}`;
  }

  /**
   * 标记菜单已加载完成
   */
  markMenuLoaded() {
    const nav = document.querySelector('nav');
    if (nav) {
      nav.classList.add('menu-loaded');
    }
  }

  /**
   * 强制隐藏所有子菜单
   */
  hideAllSubMenus() {
    const allSubMenus = document.querySelectorAll('.submenu, .thirdmenu');
    allSubMenus.forEach(menu => {
      if (menu instanceof HTMLElement) {
        menu.style.display = 'none';
      }
    });
    console.log('强制隐藏了', allSubMenus.length, '个子菜单');
  }

  /**
   * 设置支持的语言列表
   */
  setSupportedLanguages(languages) {
    this.supportedLanguages = languages;
    console.log('设置支持的语言列表', this.supportedLanguages);
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }
}

// 导出默认实例
export default MenuManager;

