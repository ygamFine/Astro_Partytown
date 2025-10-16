// 视图切换功能
function toggleView(viewType) {
  // 获取当前页面的视图容器
  const gridContainer = document.querySelector('.enhanced-grid-list');
  if (!gridContainer) return;

  // 获取视图容器
  const gridViewContainer = document.querySelector('.grid-view-container');
  const listViewContainer = document.querySelector('.list-view-container');
  
  if (!gridViewContainer || !listViewContainer) return;

  // 更新视图模式
  if (viewType === 'list') {
    // 显示列表视图，隐藏卡片视图
    gridViewContainer.classList.add('hidden');
    listViewContainer.classList.remove('hidden');
    gridContainer.setAttribute('data-view-mode', 'list');
  } else {
    // 显示卡片视图，隐藏列表视图
    listViewContainer.classList.add('hidden');
    gridViewContainer.classList.remove('hidden');
    gridContainer.setAttribute('data-view-mode', 'grid');
  }

  // 更新按钮状态 - 使用黑灰色调
  const gridBtn = document.querySelector('[data-view="grid"]');
  const listBtn = document.querySelector('[data-view="list"]');
  
  if (gridBtn && listBtn) {
    if (viewType === 'grid') {
      // 激活网格按钮
      gridBtn.classList.add('bg-gray-800', 'text-white', 'shadow-md');
      gridBtn.classList.remove('bg-gray-100', 'text-gray-600');
      // 取消激活列表按钮
      listBtn.classList.remove('bg-gray-800', 'text-white', 'shadow-md');
      listBtn.classList.add('bg-gray-100', 'text-gray-600');
    } else {
      // 激活列表按钮
      listBtn.classList.add('bg-gray-800', 'text-white', 'shadow-md');
      listBtn.classList.remove('bg-gray-100', 'text-gray-600');
      // 取消激活网格按钮
      gridBtn.classList.remove('bg-gray-800', 'text-white', 'shadow-md');
      gridBtn.classList.add('bg-gray-100', 'text-gray-600');
    }
  }

  // 保存用户偏好到localStorage
  try {
    localStorage.setItem('preferredViewMode', viewType);
  } catch (e) {
    console.warn('无法保存视图偏好设置:', e);
  }
}

// 初始化视图切换功能
function initViewToggle() {
  // 为所有视图切换按钮添加事件监听器
  document.addEventListener('click', function(e) {
    if (e.target.closest('.view-toggle-btn')) {
      const button = e.target.closest('.view-toggle-btn');
      const viewType = button.getAttribute('data-view');
      if (viewType) {
        toggleView(viewType);
      }
    }
  });

  // 恢复用户偏好的视图模式
  try {
    const savedViewMode = localStorage.getItem('preferredViewMode');
    if (savedViewMode && (savedViewMode === 'grid' || savedViewMode === 'list')) {
      // 延迟执行，确保DOM已加载
      setTimeout(() => {
        toggleView(savedViewMode);
      }, 100);
    }
  } catch (e) {
    console.warn('无法恢复视图偏好设置:', e);
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initViewToggle);
} else {
  initViewToggle();
}

// 导出函数供全局使用
window.toggleView = toggleView;
window.initViewToggle = initViewToggle;

