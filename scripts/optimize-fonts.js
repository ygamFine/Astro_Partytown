/**
 * 字体优化脚本
 * 用于进一步优化字体文件大小和加载性能
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录
const PROJECT_ROOT = path.resolve(__dirname, '..');
const FONT_DIR = path.join(PROJECT_ROOT, 'public', 'fontIcons');

/**
 * 分析当前使用的图标
 */
async function analyzeUsedIcons() {
  const srcDir = path.join(PROJECT_ROOT, 'src');
  const usedIcons = new Set();
  
  // 递归扫描源代码文件
  async function scanDirectory(dir) {
    const files = await fs.promises.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.promises.stat(filePath);
      
      if (stat.isDirectory()) {
        await scanDirectory(filePath);
      } else if (file.match(/\.(astro|js|jsx|ts|tsx|vue|svelte)$/)) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        
        // 匹配 icon-xxx 类名
        const iconMatches = content.match(/icon-[\w-]+/g);
        if (iconMatches) {
          iconMatches.forEach(icon => {
            usedIcons.add(icon.replace('icon-', ''));
          });
        }
        
        // 匹配 iconfont 类使用
        const iconfontMatches = content.match(/iconfont[^"'\s]*/g);
        if (iconfontMatches) {
          console.log(`Found iconfont usage in ${filePath}:`, iconfontMatches);
        }
      }
    }
  }
  
  await scanDirectory(srcDir);
  return Array.from(usedIcons);
}

/**
 * 生成优化的CSS文件
 */
async function generateOptimizedCSS() {
  const usedIcons = await analyzeUsedIcons();
  console.log('🔍 发现使用的图标:', usedIcons);
  
  // 读取原始CSS
  const originalCSS = await fs.promises.readFile(path.join(FONT_DIR, 'iconfont.css'), 'utf-8');
  
  // 解析@font-face
  const fontFaceMatch = originalCSS.match(/@font-face\s*\{[^}]+\}/);
  let optimizedCSS = '';
  
  if (fontFaceMatch) {
    // 保留@font-face部分并添加优化
    let fontFace = fontFaceMatch[0];
    if (!fontFace.includes('font-display')) {
      fontFace = fontFace.replace('}', '  font-display: swap;\n}');
    }
    optimizedCSS += fontFace + '\n\n';
  }
  
  // 添加基础类
  optimizedCSS += `.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  will-change: transform; /* 启用硬件加速 */
}

/* 字体加载优化 */
.font-loading .iconfont:before {
  content: "□";
  opacity: 0.3;
}

.font-loaded .iconfont:before {
  opacity: 1;
  transition: opacity 0.3s ease;
}

`;

  // 只包含使用的图标
  const iconPattern = /\.icon-([^:]+):before\s*\{[^}]+\}/g;
  let match;
  
  while ((match = iconPattern.exec(originalCSS)) !== null) {
    const iconName = match[1];
    if (usedIcons.includes(iconName)) {
      optimizedCSS += match[0] + '\n\n';
    }
  }
  
  // 保存优化后的CSS
  const optimizedPath = path.join(FONT_DIR, 'iconfont.optimized.css');
  await fs.promises.writeFile(optimizedPath, optimizedCSS);
  
  console.log(`✅ 优化的CSS已生成: ${optimizedPath}`);
  console.log(`📊 原始图标数量: ${originalCSS.match(/\.icon-/g)?.length || 0}`);
  console.log(`📊 优化后图标数量: ${usedIcons.length}`);
  console.log(`📊 文件大小减少: ${((fs.statSync(path.join(FONT_DIR, 'iconfont.css')).size - fs.statSync(optimizedPath).size) / 1024).toFixed(1)}KB`);
}

/**
 * 字体文件压缩分析
 */
async function analyzeFontFiles() {
  const fontFiles = ['iconfont.woff2', 'iconfont.woff', 'iconfont.ttf'];
  
  console.log('\n📁 字体文件分析:');
  for (const file of fontFiles) {
    const filePath = path.join(FONT_DIR, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`  ${file}: ${(stats.size / 1024).toFixed(1)}KB`);
    }
  }
}

/**
 * 生成字体加载性能报告
 */
function generatePerformanceReport() {
  const report = {
    optimizations: [
      '✅ 添加 font-display: swap',
      '✅ 预加载关键字体文件',
      '✅ 延迟加载非关键CSS',
      '✅ 内联关键图标样式',
      '✅ 字体加载状态检测',
      '✅ Unicode范围限制',
      '✅ 硬件加速优化'
    ],
    recommendations: [
      '🎯 考虑使用 SVG icons 替代字体图标',
      '🎯 实施图标按需加载',
      '🎯 使用 HTTP/2 服务器推送',
      '🎯 启用 Brotli 压缩',
      '🎯 设置适当的缓存头'
    ]
  };
  
  console.log('\n📊 字体优化报告:');
  console.log('\n已实施的优化:');
  report.optimizations.forEach(opt => console.log(opt));
  
  console.log('\n进一步建议:');
  report.recommendations.forEach(rec => console.log(rec));
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始字体优化分析...\n');
    
    await analyzeFontFiles();
    await generateOptimizedCSS();
    generatePerformanceReport();
    
    console.log('\n✨ 字体优化完成！');
  } catch (error) {
    console.error('❌ 优化过程中出错:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeUsedIcons, generateOptimizedCSS, analyzeFontFiles };
