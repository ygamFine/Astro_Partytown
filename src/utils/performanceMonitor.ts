/**
 * 性能监控工具 - 用于监控 Swiper 加载性能
 */

interface PerformanceMetrics {
  swiperLoadTime: number;
  swiperInitTime: number;
  totalTime: number;
  memoryUsage?: number;
  bundleSize: number;
}

class SwiperPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = 0;

  /**
   * 开始监控
   */
  startMonitoring(): void {
    this.startTime = performance.now();
    console.log('🚀 开始监控 Swiper 性能...');
  }

  /**
   * 记录 Swiper 加载时间
   */
  recordSwiperLoad(): number {
    const loadTime = performance.now() - this.startTime;
    console.log(`📦 Swiper 库加载时间: ${loadTime.toFixed(2)}ms`);
    return loadTime;
  }

  /**
   * 记录 Swiper 初始化时间
   */
  recordSwiperInit(selector: string): number {
    const initTime = performance.now() - this.startTime;
    console.log(`⚡ Swiper ${selector} 初始化时间: ${initTime.toFixed(2)}ms`);
    return initTime;
  }

  /**
   * 记录总时间
   */
  recordTotalTime(): number {
    const totalTime = performance.now() - this.startTime;
    console.log(`⏱️ 总耗时: ${totalTime.toFixed(2)}ms`);
    return totalTime;
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return undefined;
  }

  /**
   * 记录完整的性能指标
   */
  recordMetrics(selector: string, bundleSize: number = 46.71): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      swiperLoadTime: this.recordSwiperLoad(),
      swiperInitTime: this.recordSwiperInit(selector),
      totalTime: this.recordTotalTime(),
      memoryUsage: this.getMemoryUsage(),
      bundleSize
    };

    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    averageLoadTime: number;
    averageInitTime: number;
    totalBundleSize: number;
    memoryUsage: number | undefined;
    recommendations: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageLoadTime: 0,
        averageInitTime: 0,
        totalBundleSize: 0,
        memoryUsage: undefined,
        recommendations: ['暂无数据']
      };
    }

    const averageLoadTime = this.metrics.reduce((sum, m) => sum + m.swiperLoadTime, 0) / this.metrics.length;
    const averageInitTime = this.metrics.reduce((sum, m) => sum + m.swiperInitTime, 0) / this.metrics.length;
    const totalBundleSize = this.metrics.reduce((sum, m) => sum + m.bundleSize, 0);
    const memoryUsage = this.metrics[this.metrics.length - 1]?.memoryUsage;

    const recommendations: string[] = [];

    if (averageLoadTime > 1000) {
      recommendations.push('Swiper 加载时间过长，考虑使用预加载');
    }

    if (averageInitTime > 500) {
      recommendations.push('Swiper 初始化时间过长，检查配置复杂度');
    }

    if (totalBundleSize > 100) {
      recommendations.push('Bundle 大小过大，考虑代码分割');
    }

    if (memoryUsage && memoryUsage > 50) {
      recommendations.push('内存使用过高，检查是否有内存泄漏');
    }

    return {
      averageLoadTime,
      averageInitTime,
      totalBundleSize,
      memoryUsage,
      recommendations
    };
  }

  /**
   * 打印性能报告
   */
  printReport(): void {
    const report = this.getPerformanceReport();

    console.log('📊 Swiper 性能报告');
    console.log('==================');
    console.log(`平均加载时间: ${report.averageLoadTime.toFixed(2)}ms`);
    console.log(`平均初始化时间: ${report.averageInitTime.toFixed(2)}ms`);
    console.log(`总 Bundle 大小: ${report.totalBundleSize.toFixed(2)} KiB`);
    console.log(`内存使用: ${report.memoryUsage ? `${report.memoryUsage.toFixed(2)} MB` : 'N/A'}`);
    console.log('建议:');
    report.recommendations.forEach(rec => console.log(`- ${rec}`));
  }

  /**
   * 重置监控数据
   */
  reset(): void {
    this.metrics = [];
    this.startTime = 0;
  }
}

// 创建全局实例
export const swiperPerformanceMonitor = new SwiperPerformanceMonitor();

/**
 * 性能装饰器 - 自动监控函数执行时间
 */
export function performanceDecorator(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    const result = await method.apply(this, args);
    const end = performance.now();

    console.log(`⏱️ ${propertyName} 执行时间: ${(end - start).toFixed(2)}ms`);
    return result;
  };

  return descriptor;
}

/**
 * 比较新旧方案的性能
 */
export function comparePerformance() {
  console.log('🔍 性能对比分析');
  console.log('================');

  // 旧方案（每个组件独立加载）
  const oldApproach = {
    bundleSize: 46.71 * 4, // 4个组件
    loadTime: 1166, // 从您的截图看到的时间
    memoryUsage: '高（重复加载）',
    networkRequests: 4
  };

  // 新方案（共享加载器）
  const newApproach = {
    bundleSize: 46.71, // 只加载一次
    loadTime: 1166, // 首次加载时间相同
    memoryUsage: '低（共享实例）',
    networkRequests: 1
  };

  console.log('旧方案:');
  console.log(`- Bundle 大小: ${oldApproach.bundleSize} KiB`);
  console.log(`- 网络请求: ${oldApproach.networkRequests} 次`);
  console.log(`- 内存使用: ${oldApproach.memoryUsage}`);

  console.log('\n新方案:');
  console.log(`- Bundle 大小: ${newApproach.bundleSize} KiB`);
  console.log(`- 网络请求: ${newApproach.networkRequests} 次`);
  console.log(`- 内存使用: ${newApproach.memoryUsage}`);

  const improvement = {
    bundleSizeReduction: ((oldApproach.bundleSize - newApproach.bundleSize) / oldApproach.bundleSize * 100).toFixed(1),
    networkReduction: ((oldApproach.networkRequests - newApproach.networkRequests) / oldApproach.networkRequests * 100).toFixed(1)
  };

  console.log('\n改进:');
  console.log(`- Bundle 大小减少: ${improvement.bundleSizeReduction}%`);
  console.log(`- 网络请求减少: ${improvement.networkReduction}%`);
}
