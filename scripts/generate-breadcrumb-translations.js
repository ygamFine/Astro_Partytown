import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 面包屑翻译数据
const breadcrumbTranslations = {
  'ar': {
    "home": "الرئيسية",
    "about": "حول",
    "products": "المنتجات",
    "productDetail": "تفاصيل المنتج",
    "case": "الحالات",
    "news": "الأخبار",
    "contact": "اتصل بنا",
    "search": "نتائج البحث",
    "category": "الفئة",
    "all": "الكل",
    "skidSteerLoader": "لودر انزلاقي",
    "backhoeLoader": "لودر حفار",
    "telescopicHandler": "معالج تلسكوبي",
    "electricMachinery": "آلات كهربائية"
  },
  'de': {
    "home": "Startseite",
    "about": "Über uns",
    "products": "Produkte",
    "productDetail": "Produktdetails",
    "case": "Fälle",
    "news": "Nachrichten",
    "contact": "Kontakt",
    "search": "Suchergebnisse",
    "category": "Kategorie",
    "all": "Alle",
    "skidSteerLoader": "Kompaktlader",
    "backhoeLoader": "Baggerlader",
    "telescopicHandler": "Teleskoplader",
    "electricMachinery": "Elektrische Maschinen"
  },
  'es': {
    "home": "Inicio",
    "about": "Acerca de",
    "products": "Productos",
    "productDetail": "Detalle del producto",
    "case": "Casos",
    "news": "Noticias",
    "contact": "Contacto",
    "search": "Resultados de búsqueda",
    "category": "Categoría",
    "all": "Todos",
    "skidSteerLoader": "Cargador compacto",
    "backhoeLoader": "Cargador retroexcavadora",
    "telescopicHandler": "Manipulador telescópico",
    "electricMachinery": "Maquinaria eléctrica"
  },
  'hi': {
    "home": "होम",
    "about": "हमारे बारे में",
    "products": "उत्पाद",
    "productDetail": "उत्पाद विवरण",
    "case": "मामले",
    "news": "समाचार",
    "contact": "संपर्क",
    "search": "खोज परिणाम",
    "category": "श्रेणी",
    "all": "सभी",
    "skidSteerLoader": "स्किड स्टीयर लोडर",
    "backhoeLoader": "बैकहो लोडर",
    "telescopicHandler": "टेलीस्कोपिक हैंडलर",
    "electricMachinery": "इलेक्ट्रिक मशीनरी"
  },
  'id': {
    "home": "Beranda",
    "about": "Tentang",
    "products": "Produk",
    "productDetail": "Detail Produk",
    "case": "Kasus",
    "news": "Berita",
    "contact": "Kontak",
    "search": "Hasil Pencarian",
    "category": "Kategori",
    "all": "Semua",
    "skidSteerLoader": "Loader Skid Steer",
    "backhoeLoader": "Loader Backhoe",
    "telescopicHandler": "Handler Teleskopik",
    "electricMachinery": "Mesin Listrik"
  },
  'it': {
    "home": "Home",
    "about": "Chi siamo",
    "products": "Prodotti",
    "productDetail": "Dettaglio prodotto",
    "case": "Casi",
    "news": "Notizie",
    "contact": "Contatti",
    "search": "Risultati di ricerca",
    "category": "Categoria",
    "all": "Tutti",
    "skidSteerLoader": "Caricatore compatto",
    "backhoeLoader": "Caricatore escavatore",
    "telescopicHandler": "Manipolatore telescopico",
    "electricMachinery": "Macchine elettriche"
  },
  'ja': {
    "home": "ホーム",
    "about": "会社概要",
    "products": "製品",
    "productDetail": "製品詳細",
    "case": "事例",
    "news": "ニュース",
    "contact": "お問い合わせ",
    "search": "検索結果",
    "category": "カテゴリー",
    "all": "すべて",
    "skidSteerLoader": "スキッドステアローダー",
    "backhoeLoader": "バックホーローダー",
    "telescopicHandler": "テレスコピックハンドラー",
    "electricMachinery": "電動機械"
  },
  'ko': {
    "home": "홈",
    "about": "회사 소개",
    "products": "제품",
    "productDetail": "제품 상세",
    "case": "사례",
    "news": "뉴스",
    "contact": "연락처",
    "search": "검색 결과",
    "category": "카테고리",
    "all": "전체",
    "skidSteerLoader": "스키드 스티어 로더",
    "backhoeLoader": "백호 로더",
    "telescopicHandler": "텔레스코픽 핸들러",
    "electricMachinery": "전기 기계"
  },
  'ml': {
    "home": "ഹോം",
    "about": "നമ്മെക്കുറിച്ച്",
    "products": "ഉത്പന്നങ്ങൾ",
    "productDetail": "ഉത്പന്ന വിശദാംശങ്ങൾ",
    "case": "കേസുകൾ",
    "news": "വാർത്തകൾ",
    "contact": "ബന്ധപ്പെടുക",
    "search": "തിരയൽ ഫലങ്ങൾ",
    "category": "വിഭാഗം",
    "all": "എല്ലാം",
    "skidSteerLoader": "സ്കിഡ് സ്റ്റിയർ ലോഡർ",
    "backhoeLoader": "ബാക്ക്‌ഹോ ലോഡർ",
    "telescopicHandler": "ടെലിസ്കോപ്പിക് ഹാൻഡ്ലർ",
    "electricMachinery": "ഇലക്ട്രിക് മെഷീനറി"
  },
  'ms': {
    "home": "Laman Utama",
    "about": "Tentang",
    "products": "Produk",
    "productDetail": "Butiran Produk",
    "case": "Kes",
    "news": "Berita",
    "contact": "Hubungi",
    "search": "Hasil Carian",
    "category": "Kategori",
    "all": "Semua",
    "skidSteerLoader": "Loader Skid Steer",
    "backhoeLoader": "Loader Backhoe",
    "telescopicHandler": "Handler Teleskopik",
    "electricMachinery": "Jentera Elektrik"
  },
  'my': {
    "home": "ပင်မစာမျက်နှာ",
    "about": "အကြောင်း",
    "products": "ထုတ်ကုန်များ",
    "productDetail": "ထုတ်ကုန်အသေးစိတ်",
    "case": "အမှုများ",
    "news": "သတင်းများ",
    "contact": "ဆက်သွယ်ရန်",
    "search": "ရှာဖွေမှုရလဒ်များ",
    "category": "အမျိုးအစား",
    "all": "အားလုံး",
    "skidSteerLoader": "Skid Steer Loader",
    "backhoeLoader": "Backhoe Loader",
    "telescopicHandler": "Telescopic Handler",
    "electricMachinery": "လျှပ်စစ်စက်များ"
  },
  'nl': {
    "home": "Home",
    "about": "Over ons",
    "products": "Producten",
    "productDetail": "Productdetails",
    "case": "Cases",
    "news": "Nieuws",
    "contact": "Contact",
    "search": "Zoekresultaten",
    "category": "Categorie",
    "all": "Alle",
    "skidSteerLoader": "Kompacte loader",
    "backhoeLoader": "Graafmachine loader",
    "telescopicHandler": "Telescoop handler",
    "electricMachinery": "Elektrische machines"
  },
  'pl': {
    "home": "Strona główna",
    "about": "O nas",
    "products": "Produkty",
    "productDetail": "Szczegóły produktu",
    "case": "Przypadki",
    "news": "Aktualności",
    "contact": "Kontakt",
    "search": "Wyniki wyszukiwania",
    "category": "Kategoria",
    "all": "Wszystkie",
    "skidSteerLoader": "Ładowarka kompaktowa",
    "backhoeLoader": "Ładowarka koparko-ładowarka",
    "telescopicHandler": "Manipulator teleskopowy",
    "electricMachinery": "Maszyny elektryczne"
  },
  'pt-pt': {
    "home": "Início",
    "about": "Sobre",
    "products": "Produtos",
    "productDetail": "Detalhes do produto",
    "case": "Casos",
    "news": "Notícias",
    "contact": "Contacto",
    "search": "Resultados da pesquisa",
    "category": "Categoria",
    "all": "Todos",
    "skidSteerLoader": "Carregador compacto",
    "backhoeLoader": "Carregador retroescavadora",
    "telescopicHandler": "Manipulador telescópico",
    "electricMachinery": "Maquinaria elétrica"
  },
  'ru': {
    "home": "Главная",
    "about": "О нас",
    "products": "Продукты",
    "productDetail": "Детали продукта",
    "case": "Кейсы",
    "news": "Новости",
    "contact": "Контакты",
    "search": "Результаты поиска",
    "category": "Категория",
    "all": "Все",
    "skidSteerLoader": "Мини-погрузчик",
    "backhoeLoader": "Экскаватор-погрузчик",
    "telescopicHandler": "Телескопический погрузчик",
    "electricMachinery": "Электрические машины"
  },
  'th': {
    "home": "หน้าแรก",
    "about": "เกี่ยวกับเรา",
    "products": "ผลิตภัณฑ์",
    "productDetail": "รายละเอียดผลิตภัณฑ์",
    "case": "กรณีศึกษา",
    "news": "ข่าวสาร",
    "contact": "ติดต่อ",
    "search": "ผลการค้นหา",
    "category": "หมวดหมู่",
    "all": "ทั้งหมด",
    "skidSteerLoader": "สกิดสตีร์โหลดเดอร์",
    "backhoeLoader": "แบ็คโฮโหลดเดอร์",
    "telescopicHandler": "เทเลสโคปิกแฮนด์เลอร์",
    "electricMachinery": "เครื่องจักรไฟฟ้า"
  },
  'tr': {
    "home": "Ana Sayfa",
    "about": "Hakkımızda",
    "products": "Ürünler",
    "productDetail": "Ürün Detayı",
    "case": "Vakalar",
    "news": "Haberler",
    "contact": "İletişim",
    "search": "Arama Sonuçları",
    "category": "Kategori",
    "all": "Tümü",
    "skidSteerLoader": "Kompakt Yükleyici",
    "backhoeLoader": "Ekskavatör Yükleyici",
    "telescopicHandler": "Teleskopik İşleyici",
    "electricMachinery": "Elektrikli Makineler"
  },
  'vi': {
    "home": "Trang chủ",
    "about": "Về chúng tôi",
    "products": "Sản phẩm",
    "productDetail": "Chi tiết sản phẩm",
    "case": "Dự án",
    "news": "Tin tức",
    "contact": "Liên hệ",
    "search": "Kết quả tìm kiếm",
    "category": "Danh mục",
    "all": "Tất cả",
    "skidSteerLoader": "Máy xúc lật mini",
    "backhoeLoader": "Máy xúc lật",
    "telescopicHandler": "Máy nâng cần",
    "electricMachinery": "Máy móc điện"
  },
  'zh-Hant': {
    "home": "首頁",
    "about": "關於我們",
    "products": "產品中心",
    "productDetail": "產品詳情",
    "case": "客戶案例",
    "news": "新聞中心",
    "contact": "聯繫我們",
    "search": "搜尋結果",
    "category": "分類",
    "all": "全部",
    "skidSteerLoader": "滑移裝載機",
    "backhoeLoader": "挖掘裝載機",
    "telescopicHandler": "伸縮臂叉裝車",
    "electricMachinery": "電動工程機械"
  }
};

// 生成所有语言的翻译文件
Object.keys(breadcrumbTranslations).forEach(lang => {
  const langDir = path.join(__dirname, '..', 'src', 'locales', lang);
  const filePath = path.join(langDir, 'breadcrumb.json');
  
  // 确保目录存在
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  
  // 写入翻译文件
  fs.writeFileSync(filePath, JSON.stringify(breadcrumbTranslations[lang], null, 2));
  console.log(`✅ 已生成 ${lang}/breadcrumb.json`);
});

console.log('�� 所有面包屑翻译文件已生成完成！'); 