import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 支持的语言列表
const SUPPORTED_LANGUAGES = [
  'en', 'zh-hans', 'zh-hant', 'fr', 'de', 'es', 'ja', 'ko', 'ru', 'it', 'pt-pt',
  'nl', 'pl', 'ar', 'th', 'id', 'vi', 'ms', 'ml', 'my', 'hi', 'tr'
];

// 测试用例
const testCases = [
  {
    key: 'placeholders.search',
    expectedValues: {
      'zh-hans': '请输入关键词',
      'zh-hant': '請輸入關鍵詞',
      'en': 'Enter keywords',
      'fr': 'Entrez des mots-clés',
      'de': 'Geben Sie Schlüsselwörter ein',
      'es': 'Ingrese palabras clave',
      'ja': 'キーワードを入力してください',
      'ko': '키워드를 입력하세요',
      'ru': 'Введите ключевые слова',
      'it': 'Inserisci parole chiave',
      'pt-pt': 'Introduza palavras-chave'
    }
  },
  {
    key: 'buttons.submit',
    expectedValues: {
      'zh-hans': '提交',
      'zh-hant': '提交',
      'en': 'Submit',
      'fr': 'Soumettre',
      'de': 'Absenden',
      'es': 'Enviar',
      'ja': '送信',
      'ko': '제출',
      'ru': 'Отправить',
      'it': 'Invia',
      'pt-pt': 'Submeter'
    }
  },
  {
    key: 'validation.required',
    expectedValues: {
      'zh-hans': '此字段为必填项',
      'zh-hant': '此欄位為必填項',
      'en': 'This field is required',
      'fr': 'Ce champ est obligatoire',
      'de': 'Dieses Feld ist erforderlich',
      'es': 'Este campo es obligatorio',
      'ja': 'この項目は必須です',
      'ko': '이 필드는 필수입니다',
      'ru': 'Это поле обязательно для заполнения',
      'it': 'Questo campo è obbligatorio',
      'pt-pt': 'Este campo é obrigatório'
    }
  }
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

function testCommonFiles() {
  console.log('🧪 开始测试公共语言文件国际化...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  for (const lang of SUPPORTED_LANGUAGES) {
    const commonFile = path.join(__dirname, 'src/locales', lang, 'common.json');
    
    if (!fs.existsSync(commonFile)) {
      console.log(`❌ ${lang}: common.json 文件不存在`);
      failedTests++;
      continue;
    }
    
    try {
      const content = fs.readFileSync(commonFile, 'utf8');
      const data = JSON.parse(content);
      
      console.log(`📋 测试 ${lang} 语言文件:`);
      
      // 测试基本结构
      const requiredSections = ['placeholders', 'labels', 'validation', 'buttons', 'status', 'time', 'pagination', 'search', 'categories', 'actions', 'messages', 'units'];
      let structureValid = true;
      
      for (const section of requiredSections) {
        if (!data[section]) {
          console.log(`  ❌ 缺少 ${section} 部分`);
          structureValid = false;
        }
      }
      
      if (structureValid) {
        console.log(`  ✅ 文件结构完整`);
        passedTests++;
      } else {
        failedTests++;
      }
      
      // 测试特定翻译
      for (const testCase of testCases) {
        totalTests++;
        const actualValue = getNestedValue(data, testCase.key);
        const expectedValue = testCase.expectedValues[lang];
        
        if (expectedValue && actualValue === expectedValue) {
          console.log(`  ✅ ${testCase.key}: "${actualValue}"`);
          passedTests++;
        } else if (expectedValue) {
          console.log(`  ❌ ${testCase.key}: 期望 "${expectedValue}", 实际 "${actualValue}"`);
          failedTests++;
        }
      }
      
      // 检查是否有英文回退
      const searchPlaceholder = getNestedValue(data, 'placeholders.search');
      if (searchPlaceholder && searchPlaceholder !== 'Enter keywords') {
        console.log(`  ✅ 搜索占位符已本地化: "${searchPlaceholder}"`);
      } else {
        console.log(`  ⚠️  搜索占位符可能使用英文回退: "${searchPlaceholder}"`);
      }
      
    } catch (error) {
      console.log(`❌ ${lang}: 解析文件失败 - ${error.message}`);
      failedTests++;
    }
    
    console.log('');
  }
  
  console.log('📊 测试结果汇总:');
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过: ${passedTests}`);
  console.log(`失败: ${failedTests}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 所有测试通过！公共语言文件国际化完成！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查相关翻译文件。');
  }
}

// 运行测试
testCommonFiles(); 