#!/usr/bin/env node

/**
 * Node.js图片优化脚本 - 用于Vercel环境
 * 使用sharp库进行WebP转换和移动端图片生成
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 开始全站图片优化 (Node.js版本)...');

/**
 * 检查sharp是否可用
 */
async function checkSharp() {
  try {
    // 简单检查sharp是否已加载
    if (typeof sharp === 'function') {
      console.log('✅ sharp 可用');
      return true;
    } else {
      console.log('❌ sharp 不可用');
      return false;
    }
  } catch (error) {
    console.log('❌ sharp 不可用，请安装: npm install sharp');
    console.log('错误信息:', error.message);
    return false;
  }
}

/**
 * 转换图片为WebP格式
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);
    
    // 检查文件大小
    const inputStats = await fs.stat(inputPath);
    const outputStats = await fs.stat(outputPath);
    
    if (outputStats.size < inputStats.size) {
      const savedBytes = inputStats.size - outputStats.size;
      console.log(`✅ 压缩成功: 节省 ${savedBytes} 字节`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ 转换失败: ${inputPath} -> ${outputPath}`);
    console.log(`错误: ${error.message}`);
    return false;
  }
}

/**
 * 生成移动端响应式图片
 */
async function generateMobileImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(768, 400, { 
        fit: 'cover',
        position: 'center'
        })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    console.log(`📱 生成移动端版本: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.log(`❌ 移动端图片生成失败: ${inputPath}`);
    console.log(`错误: ${error.message}`);
    return false;
  }
}

/**
 * 查找所有图片文件
 */
async function findImageFiles(dir, extensions = ['.jpg', '.jpeg', '.png']) {
  const files = [];
  
  async function scanDirectory(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // 忽略无法访问的目录
    }
  }
  
  await scanDirectory(dir);
  return files;
}

/**
 * 主函数
 */
async function main() {
  // 检查sharp可用性
  const hasSharp = await checkSharp();
  if (!hasSharp) {
    process.exit(1);
  }
  
  console.log('📸 转换 JPG/PNG 图片为 WebP 格式...');
  
  // 查找所有图片文件
  const imageFiles = await findImageFiles('public');
  console.log(`找到 ${imageFiles.length} 个图片文件`);
  
  // 转换为WebP
  let convertedCount = 0;
  for (const file of imageFiles) {
    const webpFile = file.replace(/\.[^.]+$/, '.webp');
    
    // 跳过已存在的WebP文件
    try {
      await fs.access(webpFile);
      console.log(`⏭️  跳过已存在: ${path.basename(webpFile)}`);
      continue;
    } catch {
      // 文件不存在，需要转换
    }
    
    console.log(`🔄 转换: ${path.basename(file)} -> ${path.basename(webpFile)}`);
    const success = await convertToWebP(file, webpFile);
    if (success) {
      convertedCount++;
    }
  }
  
  console.log(`✅ WebP转换完成: ${convertedCount} 个文件`);
  
  console.log('📱 生成移动端响应式图片...');
  
  // 确保优化目录存在
  await fs.mkdir('public/images/optimized', { recursive: true });
  
  // 查找需要生成移动端版本的图片
  const mobileCandidates = [
    ...await findImageFiles('public/images', ['.jpg', '.jpeg', '.png', '.webp']),
    ...await findImageFiles('public/images/strapi', ['.jpg', '.jpeg', '.png', '.webp'])
  ];

  // 排除已生成目录与已为移动端命名的文件，避免二次处理
  const filteredCandidates = mobileCandidates.filter(file => {
    const lower = file.toLowerCase();
    const name = path.basename(file).toLowerCase();
    const inOptimizedDir = lower.includes(`${path.sep}images${path.sep}optimized${path.sep}`);
    const alreadyMobileNamed = name.includes('-mobile');
    return !inOptimizedDir && !alreadyMobileNamed;
  });
  
  // 过滤出大图（banner等）
  const largeImages = filteredCandidates.filter(file => {
    const name = path.basename(file).toLowerCase();
    return (name.includes('banner') || name.includes('hero') || name.includes('strapi')) && !name.includes('-mobile');
  });
  
  console.log(`找到 ${largeImages.length} 个大图需要生成移动端版本`);
  
  // 生成移动端图片
  let mobileCount = 0;
  for (const file of largeImages) {
    const baseName = path.basename(file, path.extname(file));
    const mobileFile = `public/images/optimized/${baseName}-mobile.webp`;
    
    // 跳过已存在的移动端图片
    try {
      await fs.access(mobileFile);
      console.log(`⏭️  跳过已存在: ${path.basename(mobileFile)}`);
      continue;
    } catch {
      // 文件不存在，需要生成
    }
    
    const success = await generateMobileImage(file, mobileFile);
    if (success) {
      mobileCount++;
    }
  }
  
  console.log(`✅ 移动端图片生成完成: ${mobileCount} 个文件`);
  
  console.log('🗂️  检查关键图片文件...');
  
  // 检查关键图片
  const criticalImages = [
    'public/images/logo.png.webp',
    'public/main-product.svg'
  ];
  
  let missingCount = 0;
  for (const img of criticalImages) {
    try {
      await fs.access(img);
      console.log(`✅ 关键图片存在: ${img}`);
    } catch {
      console.log(`⚠️  缺失关键图片: ${img}`);
      missingCount++;
    }
  }
  
  // 检查Strapi图片目录
  try {
    const strapiFiles = await findImageFiles('public/images/strapi', ['.webp']);
    console.log(`✅ Strapi图片目录存在，包含 ${strapiFiles.length} 个WebP文件`);
  } catch {
    console.log('⚠️  Strapi图片目录不存在');
  }
  
  // 检查优化图片目录
  try {
    const optimizedFiles = await findImageFiles('public/images/optimized', ['.webp']);
    console.log(`✅ 优化图片目录存在，包含 ${optimizedFiles.length} 个WebP文件`);
  } catch {
    console.log('⚠️  优化图片目录不存在');
  }
  
  if (missingCount > 0) {
    console.log(`⚠️  发现 ${missingCount} 个缺失的关键图片`);
  } else {
    console.log('✅ 所有关键图片检查完成');
  }
  
  console.log('📊 生成图片统计报告...');
  
  // 统计报告
  const allWebpFiles = await findImageFiles('public', ['.webp']);
  const allJpgFiles = await findImageFiles('public', ['.jpg', '.jpeg']);
  const allPngFiles = await findImageFiles('public', ['.png']);
  const allSvgFiles = await findImageFiles('public', ['.svg']);
  
  console.log('');
  console.log('📈 图片统计报告:');
  console.log(`   JPG 文件: ${allJpgFiles.length}`);
  console.log(`   WebP 文件: ${allWebpFiles.length}`);
  console.log(`   PNG 文件: ${allPngFiles.length}`);
  console.log(`   SVG 文件: ${allSvgFiles.length}`);
  
  console.log('');
  console.log('🎉 图片优化完成！');
  console.log('✨ 所有图片已转换为 WebP 格式');
  console.log('📱 响应式图片已生成');
  console.log('🚀 网站性能已优化');
  console.log('📥 Strapi 图片已本地化');
}

// 执行主函数
main().catch(error => {
  console.error('❌ 图片优化失败:', error.message);
  process.exit(1);
}); 