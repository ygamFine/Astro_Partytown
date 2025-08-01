import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义正确的about.json内容模板
const aboutTemplate = {
  "page_title": "About Us",
  "page_description": "Shandong Yongan Construction Machinery Group Co., Ltd. - Professional Construction Machinery Manufacturer",
  "list_description": "Shandong Yongan Construction Machinery Group Co., Ltd. was established in 2005 and is a high-tech enterprise specializing in the research, development, production and sales of construction machinery. We focus on the research and manufacturing of construction machinery products such as skid steer loaders, backhoe loaders, and telescopic handlers, which are widely used in construction sites, municipal engineering, road construction, landscaping, warehousing and logistics, and many other fields."
};

// 定义正确的contact.json内容模板
const contactTemplate = {
  "page_title": "Contact Us",
  "page_description": "Contact Shandong Yongan Construction Machinery Group Co., Ltd. - Get Product Consultation and Technical Support",
  "banner": {
    "title": "Contact Us",
    "subtitle": "Professional technical team, always ready to provide you with quality construction machinery solutions"
  },
  "form": {
    "title": "Online Consultation",
    "description": "Please fill out the form below and we will contact you as soon as possible",
    "company_name": "Company Name",
    "company_placeholder": "Please enter your company name"
  }
};

// 语言映射 - 这里只定义主要语言的翻译，其他语言使用英文作为fallback
const translations = {
  'zh-CN': {
    about: {
      "page_title": "关于我们",
      "page_description": "山东永安建设机械集团有限公司 - 专业工程机械制造商",
      "list_description": "山东永安建设机械集团有限公司成立于2005年，是一家专业从事工程机械研发、生产和销售的高新技术企业。我们专注于滑移装载机、挖掘装载机、伸缩臂叉装车等工程机械产品的研发与制造，产品广泛应用于建筑工地、市政工程、道路建设、园林绿化、仓储物流等多个领域。"
    },
    contact: {
      "page_title": "联系我们",
      "page_description": "联系山东永安建设机械集团有限公司 - 获取产品咨询和技术支持",
      "banner": {
        "title": "联系我们",
        "subtitle": "专业的技术团队，随时为您提供优质的工程机械解决方案"
      },
      "form": {
        "title": "在线咨询",
        "description": "请填写以下表单，我们会尽快与您联系",
        "company_name": "公司名称",
        "company_placeholder": "请输入您的公司名称"
      }
    }
  },
  'zh-Hant': {
    about: {
      "page_title": "關於我們",
      "page_description": "山東永安建設機械集團有限公司 - 專業工程機械製造商",
      "list_description": "山東永安建設機械集團有限公司成立於2005年，是一家專業從事工程機械研發、生產和銷售的高新技術企業。我們專注於滑移裝載機、挖掘裝載機、伸縮臂叉裝車等工程機械產品的研發與製造，產品廣泛應用於建築工地、市政工程、道路建設、園林綠化、倉儲物流等多個領域。"
    },
    contact: {
      "page_title": "聯繫我們",
      "page_description": "聯繫山東永安建設機械集團有限公司 - 獲取產品諮詢和技術支持",
      "banner": {
        "title": "聯繫我們",
        "subtitle": "專業的技術團隊，隨時為您提供優質的工程機械解決方案"
      },
      "form": {
        "title": "在線諮詢",
        "description": "請填寫以下表單，我們會盡快與您聯繫",
        "company_name": "公司名稱",
        "company_placeholder": "請輸入您的公司名稱"
      }
    }
  },
  'ja': {
    about: {
      "page_title": "会社概要",
      "page_description": "山東永安建設機械集団有限公司 - 専門建設機械メーカー",
      "list_description": "山東永安建設機械集団有限公司は2005年に設立され、建設機械の研究開発、生産、販売に特化したハイテク企業です。スキッドステアローダー、バックホー、テレスコピックハンドラーなどの建設機械製品の研究開発と製造に注力しており、建設現場、市政工事、道路建設、造園、倉庫・物流など多くの分野で広く使用されています。"
    },
    contact: {
      "page_title": "お問い合わせ",
      "page_description": "山東永安建設機械集団有限公司にお問い合わせ - 製品相談と技術サポートを取得",
      "banner": {
        "title": "お問い合わせ",
        "subtitle": "専門的な技術チーム、常に質の高い建設機械ソリューションを提供する準備ができています"
      },
      "form": {
        "title": "オンライン相談",
        "description": "以下のフォームにご記入いただき、できるだけ早くご連絡いたします",
        "company_name": "会社名",
        "company_placeholder": "会社名を入力してください"
      }
    }
  }
};

// 获取所有语言目录
const localesDir = path.join(__dirname, '../src/locales');
const languages = fs.readdirSync(localesDir).filter(dir => 
  fs.statSync(path.join(localesDir, dir)).isDirectory()
);

console.log('开始修正国际化文件...');

languages.forEach(lang => {
  console.log(`处理语言: ${lang}`);
  
  // 处理about.json
  const aboutPath = path.join(localesDir, lang, 'about.json');
  if (fs.existsSync(aboutPath)) {
    const aboutContent = translations[lang]?.about || aboutTemplate;
    fs.writeFileSync(aboutPath, JSON.stringify(aboutContent, null, 2));
    console.log(`  ✓ 修正了 ${lang}/about.json`);
  }
  
  // 处理contact.json
  const contactPath = path.join(localesDir, lang, 'contact.json');
  if (fs.existsSync(contactPath)) {
    const contactContent = translations[lang]?.contact || contactTemplate;
    fs.writeFileSync(contactPath, JSON.stringify(contactContent, null, 2));
    console.log(`  ✓ 修正了 ${lang}/contact.json`);
  }
});

console.log('\n所有文件修正完成！');
console.log('注意：只有中文简体、中文繁体、日语有完整翻译，其他语言使用英文作为fallback。'); 