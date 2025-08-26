#!/usr/bin/env node

/**
 * Node.js图片优化脚本 - 用于Vercel环境
 * 使用sharp库进行WebP转换和移动端图片生成
 */

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

/**
 * 检查图片是否为Banner图片
 */
async function isBannerImage(filePath) {
  try {
    // 读取Banner配置文件
    const configPath = path.join(process.cwd(), 'src/data/banner-images.json');
    
    // 检查配置文件是否存在，如果不存在则创建默认配置
    let config;
    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      config = JSON.parse(configData);
    } catch (error) {
      console.warn('Banner配置文件不存在，创建默认配置');
      config = { bannerImages: [] };
      
      // 确保目录存在
      const configDir = path.dirname(configPath);
      try {
        await fs.mkdir(configDir, { recursive: true });
      } catch (mkdirError) {
        console.warn('创建配置目录失败:', mkdirError.message);
      }
    }

    // 检查文件路径是否在banner配置中
    const normalizedPath = filePath.replace(/\\/g, '/'); // 统一路径分隔符
    const fileName = path.basename(filePath);
    const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));

    return config.bannerImages.some(banner => {
      const bannerPath = banner.localPath.replace(/\\/g, '/');
      const bannerFileName = path.basename(bannerPath);
      const bannerFileNameWithoutExt = path.basename(bannerPath, path.extname(bannerPath));

      // 只使用配置文件中的路径匹配，不使用文件名
      return normalizedPath.includes(bannerPath);
    });
  } catch (error) {
    console.warn('读取banner配置文件失败:', error.message);
    // 如果配置文件不存在或读取失败，则回退到目录检查
    const normalizedPath = filePath.replace(/\\/g, '/');
    return normalizedPath.includes('/banner/');
  }
}

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
async function findResourceFiles(dir, extensions = ['.jpg', '.jpeg', '.png']) {
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
  const imageFiles = await findResourceFiles('public');
  const strapiImageFiles = await findResourceFiles('src/assets/strapi', ['.jpg', '.jpeg', '.png', '.webp']);
  const allImageFiles = [...imageFiles, ...strapiImageFiles];
  
  console.log(`📁 找到图片文件: public=${imageFiles.length}, strapi=${strapiImageFiles.length}`);
  
  // 优化现有图片（包括WebP）
  let optimizedCount = 0;
  for (const file of allImageFiles) {
    // 检查是否是Banner图片，如果是则跳过压缩
    // 基于配置文件的智能识别
    const isBanner = await isBannerImage(file);

    if (isBanner) {
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
  
  // 检查其他静态资源
  console.log('\n📊 静态资源检查报告:');

  // 检查字体文件
  try {
    const fontFiles = await findResourceFiles('public/fontIcons', ['.woff', '.woff2', '.ttf']);
    console.log(`✅ 字体文件: ${fontFiles.length} 个`);
  } catch {
    console.log('⚠️  字体文件检查失败');
  }

  // 检查JavaScript文件
  try {
    const jsFiles = await findResourceFiles('public/scripts', ['.js']);
    console.log(`✅ JavaScript文件: ${jsFiles.length} 个`);
  } catch {
    console.log('⚠️  JavaScript文件检查失败');
  }

  // 检查PDF文件
  try {
    const pdfFiles = await findResourceFiles('public', ['.pdf']);
    console.log(`✅ PDF文件: ${pdfFiles.length} 个`);
  } catch {
    console.log('⚠️  PDF文件检查失败');
  }

  if (missingCount > 0) {
    console.log(`⚠️  发现 ${missingCount} 个缺失的关键图片`);
  } else {
    console.log('✅ 所有关键图片检查完成');
  }
  
  // 统计报告
  const allWebpFiles = await findResourceFiles('public', ['.webp']);
  const allJpgFiles = await findResourceFiles('public', ['.jpg', '.jpeg']);
  const allPngFiles = await findResourceFiles('public', ['.png']);
  const allSvgFiles = await findResourceFiles('public', ['.svg']);
  
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