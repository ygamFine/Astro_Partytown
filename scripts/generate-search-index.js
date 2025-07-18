#!/usr/bin/env node

/**
 * 构建时搜索索引生成脚本
 * 在 Astro 构建过程中生成搜索索引 JSON 文件
 */

import { generateSearchIndex } from '../src/lib/searchIndex.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function generateSearchIndexFile() {
  try {
    console.log('🚀 开始生成 SSG 搜索索引...');
    
    // 生成搜索索引数据
    const searchData = await generateSearchIndex();
    
    // 确保 public 目录存在
    const publicDir = join(process.cwd(), 'public');
    try {
      mkdirSync(publicDir, { recursive: true });
    } catch (error) {
      // 目录已存在，忽略错误
    }
    
    // 写入搜索索引文件
    const indexPath = join(publicDir, 'search-index.json');
    const jsonContent = JSON.stringify(searchData, null, 2);
    
    writeFileSync(indexPath, jsonContent, 'utf8');
    
    console.log('✅ SSG 搜索索引生成完成!');
    console.log(`📁 文件位置: ${indexPath}`);
    console.log(`📊 索引统计:`);
    console.log(`   - 产品: ${searchData.products.length} 个`);
    console.log(`   - 新闻: ${searchData.news.length} 条`);
    console.log(`   - 案例: ${searchData.cases.length} 个`);
    console.log(`   - 总计: ${searchData.products.length + searchData.news.length + searchData.cases.length} 项`);
    
  } catch (error) {
    console.error('❌ 生成搜索索引失败:', error);
    process.exit(1);
  }
}

// 直接执行脚本
generateSearchIndexFile();

export { generateSearchIndexFile }; 