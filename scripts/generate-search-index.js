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
    
    // 验证数据质量
    let validProducts = 0;
    let validNews = 0;
    let validCases = 0;
    
    searchData.products.forEach(product => {
      if (product.title && product.title !== `产品 ${product.id}`) {
        validProducts++;
      }
    });
    
    searchData.news.forEach(news => {
      if (news.title && news.title !== `新闻 ${news.id}`) {
        validNews++;
      }
    });
    
    searchData.cases.forEach(caseItem => {
      if (caseItem.title && caseItem.title !== `案例 ${caseItem.id}`) {
        validCases++;
      }
    });
    
    console.log(`🔍 数据质量检查:`);
    console.log(`   - 有效产品: ${validProducts}/${searchData.products.length}`);
    console.log(`   - 有效新闻: ${validNews}/${searchData.news.length}`);
    console.log(`   - 有效案例: ${validCases}/${searchData.cases.length}`);
    
    if (validProducts === 0 && validNews === 0 && validCases === 0) {
      console.warn('⚠️  警告: 没有找到有效的数据，搜索功能可能无法正常工作');
    }
    
  } catch (error) {
    console.error('❌ 生成搜索索引失败:', error);
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