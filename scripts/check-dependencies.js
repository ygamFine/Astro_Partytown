#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 检查系统依赖...');

// 检查ImageMagick
function checkImageMagick() {
  try {
    execSync('which convert', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// 检查cwebp
function checkCwebp() {
  try {
    execSync('which cwebp', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// 检查是否为CI环境
function isCI() {
  return process.env.CI === 'true' || 
         process.env.VERCEL === '1' || 
         process.env.NETLIFY === 'true' ||
         process.env.GITHUB_ACTIONS === 'true';
}

const hasImageMagick = checkImageMagick();
const hasCwebp = checkCwebp();
const isCIEnvironment = isCI();

console.log(`📦 ImageMagick: ${hasImageMagick ? '✅ 已安装' : '❌ 未安装'}`);
console.log(`📦 cwebp: ${hasCwebp ? '✅ 已安装' : '❌ 未安装'}`);
console.log(`🌐 环境: ${isCIEnvironment ? 'CI/CD' : '本地开发'}`);

// 如果缺少依赖且是CI环境，跳过图片优化
if ((!hasImageMagick || !hasCwebp) && isCIEnvironment) {
  console.log('⚠️  CI环境中缺少图片优化依赖，跳过图片优化步骤');
  console.log('💡 建议在本地运行图片优化后提交到仓库');
  process.exit(0);
}

// 如果缺少依赖且不是CI环境，提示安装
if (!hasImageMagick || !hasCwebp) {
  console.log('\n❌ 缺少图片优化依赖');
  console.log('📋 安装说明:');
  console.log('macOS: brew install imagemagick webp');
  console.log('Ubuntu: sudo apt-get install imagemagick webp');
  console.log('Windows: 下载并安装 ImageMagick 和 WebP 工具');
  process.exit(1);
}

console.log('✅ 所有依赖已满足，可以运行图片优化');
process.exit(0); 