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
    

    
    // 验证数据质量
    const validProducts = searchData.products.filter(product => 
      product.title && product.title !== `产品 ${product.id}`
    ).length;
    
    const validNews = searchData.news.filter(news => 
      news.title && news.title !== `新闻 ${news.id}`
    ).length;
    
    const validCases = searchData.cases.filter(caseItem => 
      caseItem.title && caseItem.title !== `案例 ${caseItem.id}`
    ).length;
    

    
  } catch (error) {

    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSearchIndexFile();
} else {
  // 如果作为模块导入，也执行生成
  generateSearchIndexFile();
}

export { generateSearchIndexFile }; 