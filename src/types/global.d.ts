// 全局类型声明
declare global {
  interface Window {
    openContactModal: (productInfo?: { name?: string }) => void;
  }
}

export {}; 