import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 需要更新的文件列表
const filesToUpdate = [
  'src/pages/[lang]/news/[...page].astro',
  'src/pages/[lang]/news/[slug].astro',
  'src/pages/[lang]/products/[slug].astro',
];

// 更新单个文件
function updateFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;

    // 替换导入语句
    if (content.includes("import { getEnabledLanguages } from")) {
      content = content.replace(
        /import \{ getEnabledLanguages \} from ['"]([^'"]+)['"];?/g,
        "import { SUPPORTED_LANGUAGES } from '$1';"
      );
      updated = true;
    }

    if (content.includes("import { mergeTranslations } from")) {
      content = content.replace(
        /import \{ mergeTranslations \} from ['"]([^'"]+)['"];?/g,
        "import getDictionary from '$1';"
      );
      updated = true;
    }

    // 替换 getEnabledLanguages() 调用
    if (content.includes('getEnabledLanguages()')) {
      content = content.replace(/getEnabledLanguages\(\)/g, 'SUPPORTED_LANGUAGES');
      updated = true;
    }

    // 替换 mergeTranslations 调用
    if (content.includes('mergeTranslations(')) {
      content = content.replace(
        /const translations = await mergeTranslations\(lang, \[([^\]]+)\]\);?/g,
        'const ui = getDictionary(lang);'
      );
      updated = true;
    }

    // 替换 translations 变量引用
    if (content.includes('translations.')) {
      content = content.replace(/translations\./g, 'ui.');
      updated = true;
    }

    // 替换 t 变量引用
    if (content.includes('const t =')) {
      content = content.replace(/const t = \(translations as any\)\.([^;]+);?/g, '');
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ 已更新: ${filePath}`);
    } else {
      console.log(`⏭️  无需更新: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ 更新失败: ${filePath}`, error.message);
  }
}

// 主函数
function main() {
  console.log('开始批量更新页面文件...');
  
  filesToUpdate.forEach(file => {
    updateFile(file);
  });
  
  console.log('批量更新完成！');
}

main(); 