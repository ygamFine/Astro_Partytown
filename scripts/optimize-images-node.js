#!/usr/bin/env node

/**
 * Node.js图片优化脚本 - 用于Vercel环境
 * 使用sharp库进行WebP转换和移动端图片生成
 */

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

/**
 * 检查sharp是否可用
 */
async function checkSharp() {
  try {
    // 简单检查sharp是否已加载
    if (typeof sharp === 'function') {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('sharp 不可用，请安装: npm install sharp');
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
    console.error(`❌ 转换失败: ${inputPath} -> ${outputPath}`);
    return false;
  }
}

// 移动端图片由 Strapi 提供，不在构建时额外生成

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
          // 跳过 node_modules 和 .git 目录
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await scanDirectory(fullPath);
          }
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
  
  // 查找所有图片文件
  const imageFiles = await findImageFiles('public');
  const strapiImageFiles = await findImageFiles('src/assets/strapi', ['.jpg', '.jpeg', '.png', '.webp']);
  const allImageFiles = [...imageFiles, ...strapiImageFiles];
  
  console.log(`📁 找到图片文件: public=${imageFiles.length}, strapi=${strapiImageFiles.length}`);
  
  // 优化现有图片（包括WebP）
  let optimizedCount = 0;
  for (const file of allImageFiles) {
    // 检查是否是Banner图片，如果是则跳过压缩
    // Banner图片现在被放在banner子目录中
    const isBannerImage = file.includes(path.sep + 'banner' + path.sep);

    if (isBannerImage) {
      console.log(`📷 跳过Banner图片压缩: ${file}`);
      continue;
    }

    // 获取文件信息
    const stats = await fs.stat(file);
    const fileSizeKB = Math.round(stats.size / 1024);

    // 只优化大于50KB的图片
    if (fileSizeKB > 50) {
      console.log(`🔧 优化大图片: ${file} (${fileSizeKB}KB)`);

      try {
        // 使用sharp重新压缩
        const buffer = await sharp(file)
          .webp({ quality: 80, effort: 6 })
          .toBuffer();

        // 如果压缩后更小，则替换原文件
        if (buffer.length < stats.size) {
          await fs.writeFile(file, buffer);
          const newSizeKB = Math.round(buffer.length / 1024);
          const savedKB = fileSizeKB - newSizeKB;
          console.log(`   ✅ 优化成功: ${fileSizeKB}KB -> ${newSizeKB}KB (节省${savedKB}KB)`);
          optimizedCount++;
        } else {
          console.log(`   ⏭️  已是最优: ${fileSizeKB}KB`);
        }
      } catch (error) {
        console.log(`   ❌ 优化失败: ${error.message}`);
      }
    }
  }
  
  console.log(`✅ 图片优化完成: ${optimizedCount} 个文件`);
  
  // 不生成移动端图片；移动端资源由 Strapi 提供
  
  // 检查关键图片
  const criticalImages = [
  ];
  
  let missingCount = 0;
  for (const img of criticalImages) {
    try {
      await fs.access(img);
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
  
  
  if (missingCount > 0) {
    console.log(`⚠️  发现 ${missingCount} 个缺失的关键图片`);
  } else {
    console.log('✅ 所有关键图片检查完成');
  }
  
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
}

// 执行主函数
main().catch(error => {
  console.error('❌ 图片优化失败:', error.message);
  process.exit(1);
}); 