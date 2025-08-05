#!/usr/bin/env node

/**
 * Vercel 专用构建脚本
 * 在 Vercel 部署环境中处理图片下载和优化
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vercel 环境检测
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const isProduction = process.env.NODE_ENV === 'production';

console.log('🚀 Vercel 构建脚本开始执行...');
console.log('🔧 环境信息:');
console.log(`   - Vercel 环境: ${isVercel ? '是' : '否'}`);
console.log(`   - 生产环境: ${isProduction ? '是' : '否'}`);
console.log(`   - 工作目录: ${process.cwd()}`);

async function vercelBuild() {
  try {
    // 1. 设置 Vercel 环境变量
    if (isVercel) {
      process.env.IMAGE_CACHE_DIR = '/vercel/path0/dist/public/images/strapi';
      process.env.NODE_ENV = 'production';
      console.log('✅ Vercel 环境变量已设置');
    }

    // 2. 下载 Strapi 图片
    console.log('\n📥 开始下载 Strapi 图片...');
    execSync('node scripts/download-strapi-images.js', { 
      stdio: 'inherit',
      env: { ...process.env }
    });

    // 3. 优化图片（在 Vercel 中跳过，因为需要系统依赖）
    if (!isVercel) {
      console.log('\n🔄 开始优化图片...');
      execSync('bash scripts/optimize-images.sh', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
    } else {
      console.log('⏭️  Vercel 环境中跳过图片优化（需要系统依赖）');
    }

    // 4. 构建 Astro 项目
    console.log('\n🏗️  开始构建 Astro 项目...');
    execSync('astro build', { 
      stdio: 'inherit',
      env: { ...process.env }
    });

    // 5. 生成搜索索引
    console.log('\n🔍 生成搜索索引...');
    execSync('node scripts/generate-search-index.js', { 
      stdio: 'inherit',
      env: { ...process.env }
    });

    // 6. 验证构建结果
    console.log('\n✅ 验证构建结果...');
    const distPath = path.join(process.cwd(), 'dist');
    const imagesPath = path.join(distPath, 'images', 'strapi');

    try {
      const distStats = await fs.stat(distPath);
      console.log(`✅ dist 目录存在: ${distPath}`);
      
      const imagesStats = await fs.stat(imagesPath);
      console.log(`✅ images/strapi 目录存在: ${imagesPath}`);
      
      // 检查图片文件
      const imageFiles = await fs.readdir(imagesPath);
      console.log(`📊 Strapi 图片数量: ${imageFiles.length}`);
      
      if (imageFiles.length > 0) {
        console.log('📋 图片文件列表:');
        imageFiles.slice(0, 5).forEach(file => {
          console.log(`   - ${file}`);
        });
        if (imageFiles.length > 5) {
          console.log(`   ... 还有 ${imageFiles.length - 5} 个文件`);
        }
      }
      
    } catch (error) {
      console.error('❌ 构建验证失败:', error.message);
      throw error;
    }

    console.log('\n🎉 Vercel 构建完成！');
    console.log('📁 构建输出目录:', distPath);
    console.log('🖼️  图片缓存目录:', imagesPath);

  } catch (error) {
    console.error('❌ Vercel 构建失败:', error.message);
    process.exit(1);
  }
}

// 执行构建
vercelBuild(); 