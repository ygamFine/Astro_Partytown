import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 所有语言的翻译数据
const translations = {
  'en': {
    "paging": {
      "previous": "Previous",
      "next": "Next",
      "page": "Page",
      "of": "of",
      "first": "First",
      "last": "Last",
      "showing": "Showing",
      "to": "to",
      "ofTotal": "of",
      "items": "items",
      "pages": "pages"
    },
    "aria": {
      "pagination": "Pagination navigation",
      "previous": "Previous page",
      "next": "Next page",
      "page": "Go to page",
      "first": "Go to first page",
      "last": "Go to last page"
    }
  },
  'zh-hans': {
    "paging": {
      "previous": "上一页",
      "next": "下一页",
      "page": "第",
      "of": "页，共",
      "first": "首页",
      "last": "尾页",
      "showing": "显示",
      "to": "到",
      "ofTotal": "共",
      "items": "项",
      "pages": "页"
    },
    "aria": {
      "pagination": "分页导航",
      "previous": "上一页",
      "next": "下一页",
      "page": "跳转到第",
      "first": "跳转到首页",
      "last": "跳转到尾页"
    }
  },
  'zh-hant': {
    "paging": {
      "previous": "上一頁",
      "next": "下一頁",
      "page": "第",
      "of": "頁，共",
      "first": "首頁",
      "last": "尾頁",
      "showing": "顯示",
      "to": "到",
      "ofTotal": "共",
      "items": "項",
      "pages": "頁"
    },
    "aria": {
      "pagination": "分頁導航",
      "previous": "上一頁",
      "next": "下一頁",
      "page": "跳轉到第",
      "first": "跳轉到首頁",
      "last": "跳轉到尾頁"
    }
  },
  'fr': {
    "paging": {
      "previous": "Précédent",
      "next": "Suivant",
      "page": "Page",
      "of": "sur",
      "first": "Premier",
      "last": "Dernier",
      "showing": "Affichage",
      "to": "à",
      "ofTotal": "sur",
      "items": "éléments",
      "pages": "pages"
    },
    "aria": {
      "pagination": "Navigation de pagination",
      "previous": "Page précédente",
      "next": "Page suivante",
      "page": "Aller à la page",
      "first": "Aller à la première page",
      "last": "Aller à la dernière page"
    }
  },
  'de': {
    "paging": {
      "previous": "Zurück",
      "next": "Weiter",
      "page": "Seite",
      "of": "von",
      "first": "Erste",
      "last": "Letzte",
      "showing": "Anzeige",
      "to": "bis",
      "ofTotal": "von",
      "items": "Elemente",
      "pages": "Seiten"
    },
    "aria": {
      "pagination": "Seitennavigation",
      "previous": "Vorherige Seite",
      "next": "Nächste Seite",
      "page": "Zur Seite gehen",
      "first": "Zur ersten Seite gehen",
      "last": "Zur letzten Seite gehen"
    }
  },
  'it': {
    "paging": {
      "previous": "Precedente",
      "next": "Successivo",
      "page": "Pagina",
      "of": "di",
      "first": "Prima",
      "last": "Ultima",
      "showing": "Mostrando",
      "to": "a",
      "ofTotal": "di",
      "items": "elementi",
      "pages": "pagine"
    },
    "aria": {
      "pagination": "Navigazione paginazione",
      "previous": "Pagina precedente",
      "next": "Pagina successiva",
      "page": "Vai alla pagina",
      "first": "Vai alla prima pagina",
      "last": "Vai all'ultima pagina"
    }
  },
  'tr': {
    "paging": {
      "previous": "Önceki",
      "next": "Sonraki",
      "page": "Sayfa",
      "of": "/",
      "first": "İlk",
      "last": "Son",
      "showing": "Gösteriliyor",
      "to": "ile",
      "ofTotal": "toplam",
      "items": "öğe",
      "pages": "sayfa"
    },
    "aria": {
      "pagination": "Sayfalama navigasyonu",
      "previous": "Önceki sayfa",
      "next": "Sonraki sayfa",
      "page": "Sayfaya git",
      "first": "İlk sayfaya git",
      "last": "Son sayfaya git"
    }
  },
  'es': {
    "paging": {
      "previous": "Anterior",
      "next": "Siguiente",
      "page": "Página",
      "of": "de",
      "first": "Primera",
      "last": "Última",
      "showing": "Mostrando",
      "to": "a",
      "ofTotal": "de",
      "items": "elementos",
      "pages": "páginas"
    },
    "aria": {
      "pagination": "Navegación de paginación",
      "previous": "Página anterior",
      "next": "Página siguiente",
      "page": "Ir a la página",
      "first": "Ir a la primera página",
      "last": "Ir a la última página"
    }
  },
  'pt-pt': {
    "paging": {
      "previous": "Anterior",
      "next": "Próximo",
      "page": "Página",
      "of": "de",
      "first": "Primeira",
      "last": "Última",
      "showing": "Mostrando",
      "to": "a",
      "ofTotal": "de",
      "items": "itens",
      "pages": "páginas"
    },
    "aria": {
      "pagination": "Navegação de paginação",
      "previous": "Página anterior",
      "next": "Página seguinte",
      "page": "Ir para a página",
      "first": "Ir para a primeira página",
      "last": "Ir para a última página"
    }
  },
  'nl': {
    "paging": {
      "previous": "Vorige",
      "next": "Volgende",
      "page": "Pagina",
      "of": "van",
      "first": "Eerste",
      "last": "Laatste",
      "showing": "Toon",
      "to": "tot",
      "ofTotal": "van",
      "items": "items",
      "pages": "pagina's"
    },
    "aria": {
      "pagination": "Paginering navigatie",
      "previous": "Vorige pagina",
      "next": "Volgende pagina",
      "page": "Ga naar pagina",
      "first": "Ga naar eerste pagina",
      "last": "Ga naar laatste pagina"
    }
  },
  'pl': {
    "paging": {
      "previous": "Poprzednia",
      "next": "Następna",
      "page": "Strona",
      "of": "z",
      "first": "Pierwsza",
      "last": "Ostatnia",
      "showing": "Pokazuję",
      "to": "do",
      "ofTotal": "z",
      "items": "elementów",
      "pages": "stron"
    },
    "aria": {
      "pagination": "Nawigacja paginacji",
      "previous": "Poprzednia strona",
      "next": "Następna strona",
      "page": "Przejdź do strony",
      "first": "Przejdź do pierwszej strony",
      "last": "Przejdź do ostatniej strony"
    }
  },
  'ar': {
    "paging": {
      "previous": "السابق",
      "next": "التالي",
      "page": "الصفحة",
      "of": "من",
      "first": "الأولى",
      "last": "الأخيرة",
      "showing": "عرض",
      "to": "إلى",
      "ofTotal": "من",
      "items": "عنصر",
      "pages": "صفحة"
    },
    "aria": {
      "pagination": "تنقل الصفحات",
      "previous": "الصفحة السابقة",
      "next": "الصفحة التالية",
      "page": "انتقل إلى الصفحة",
      "first": "انتقل إلى الصفحة الأولى",
      "last": "انتقل إلى الصفحة الأخيرة"
    }
  },
  'ru': {
    "paging": {
      "previous": "Предыдущая",
      "next": "Следующая",
      "page": "Страница",
      "of": "из",
      "first": "Первая",
      "last": "Последняя",
      "showing": "Показано",
      "to": "до",
      "ofTotal": "из",
      "items": "элементов",
      "pages": "страниц"
    },
    "aria": {
      "pagination": "Навигация по страницам",
      "previous": "Предыдущая страница",
      "next": "Следующая страница",
      "page": "Перейти на страницу",
      "first": "Перейти на первую страницу",
      "last": "Перейти на последнюю страницу"
    }
  },
  'th': {
    "paging": {
      "previous": "ก่อนหน้า",
      "next": "ถัดไป",
      "page": "หน้า",
      "of": "จาก",
      "first": "แรก",
      "last": "สุดท้าย",
      "showing": "แสดง",
      "to": "ถึง",
      "ofTotal": "จาก",
      "items": "รายการ",
      "pages": "หน้า"
    },
    "aria": {
      "pagination": "การนำทางหน้า",
      "previous": "หน้าก่อนหน้า",
      "next": "หน้าถัดไป",
      "page": "ไปที่หน้า",
      "first": "ไปที่หน้าแรก",
      "last": "ไปที่หน้าสุดท้าย"
    }
  },
  'id': {
    "paging": {
      "previous": "Sebelumnya",
      "next": "Selanjutnya",
      "page": "Halaman",
      "of": "dari",
      "first": "Pertama",
      "last": "Terakhir",
      "showing": "Menampilkan",
      "to": "ke",
      "ofTotal": "dari",
      "items": "item",
      "pages": "halaman"
    },
    "aria": {
      "pagination": "Navigasi halaman",
      "previous": "Halaman sebelumnya",
      "next": "Halaman selanjutnya",
      "page": "Pergi ke halaman",
      "first": "Pergi ke halaman pertama",
      "last": "Pergi ke halaman terakhir"
    }
  },
  'vi': {
    "paging": {
      "previous": "Trước",
      "next": "Tiếp",
      "page": "Trang",
      "of": "trên",
      "first": "Đầu",
      "last": "Cuối",
      "showing": "Hiển thị",
      "to": "đến",
      "ofTotal": "trên",
      "items": "mục",
      "pages": "trang"
    },
    "aria": {
      "pagination": "Điều hướng phân trang",
      "previous": "Trang trước",
      "next": "Trang tiếp theo",
      "page": "Đi đến trang",
      "first": "Đi đến trang đầu",
      "last": "Đi đến trang cuối"
    }
  },
  'ms': {
    "paging": {
      "previous": "Sebelumnya",
      "next": "Seterusnya",
      "page": "Halaman",
      "of": "daripada",
      "first": "Pertama",
      "last": "Terakhir",
      "showing": "Memaparkan",
      "to": "kepada",
      "ofTotal": "daripada",
      "items": "item",
      "pages": "halaman"
    },
    "aria": {
      "pagination": "Navigasi halaman",
      "previous": "Halaman sebelumnya",
      "next": "Halaman seterusnya",
      "page": "Pergi ke halaman",
      "first": "Pergi ke halaman pertama",
      "last": "Pergi ke halaman terakhir"
    }
  },
  'ml': {
    "paging": {
      "previous": "മുമ്പത്തെ",
      "next": "അടുത്തത്",
      "page": "പേജ്",
      "of": "ഇതിൽ",
      "first": "ആദ്യം",
      "last": "അവസാനം",
      "showing": "കാണിക്കുന്നു",
      "to": "വരെ",
      "ofTotal": "ഇതിൽ",
      "items": "ഇനങ്ങൾ",
      "pages": "പേജുകൾ"
    },
    "aria": {
      "pagination": "പേജിനേഷൻ നാവിഗേഷൻ",
      "previous": "മുമ്പത്തെ പേജ്",
      "next": "അടുത്ത പേജ്",
      "page": "പേജിലേക്ക് പോകുക",
      "first": "ആദ്യ പേജിലേക്ക് പോകുക",
      "last": "അവസാന പേജിലേക്ക് പോകുക"
    }
  },
  'my': {
    "paging": {
      "previous": "ယခင်က",
      "next": "နောက်",
      "page": "စာမျက်နှာ",
      "of": "ထဲက",
      "first": "ပထမ",
      "last": "နောက်ဆုံး",
      "showing": "ြသခြင်း",
      "to": "သို့",
      "ofTotal": "ထဲက",
      "items": "အမျိုးအစား",
      "pages": "စာမျက်နှာများ"
    },
    "aria": {
      "pagination": "စာမျက်နှာ လမ်းညွှန်",
      "previous": "ယခင်စာမျက်နှာ",
      "next": "နောက်စာမျက်နှာ",
      "page": "စာမျက်နှာသို့သွားရန်",
      "first": "ပထမစာမျက်နှာသို့သွားရန်",
      "last": "နောက်ဆုံးစာမျက်နှာသို့သွားရန်"
    }
  },
  'hi': {
    "paging": {
      "previous": "पिछला",
      "next": "अगला",
      "page": "पृष्ठ",
      "of": "का",
      "first": "पहला",
      "last": "आखिरी",
      "showing": "दिखा रहा है",
      "to": "से",
      "ofTotal": "का",
      "items": "आइटम",
      "pages": "पृष्ठ"
    },
    "aria": {
      "pagination": "पृष्ठ नेविगेशन",
      "previous": "पिछला पृष्ठ",
      "next": "अगला पृष्ठ",
      "page": "पृष्ठ पर जाएं",
      "first": "पहले पृष्ठ पर जाएं",
      "last": "आखिरी पृष्ठ पर जाएं"
    }
  },
  'ja': {
    "paging": {
      "previous": "前へ",
      "next": "次へ",
      "page": "ページ",
      "of": "の",
      "first": "最初",
      "last": "最後",
      "showing": "表示中",
      "to": "から",
      "ofTotal": "合計",
      "items": "件",
      "pages": "ページ"
    },
    "aria": {
      "pagination": "ページネーション",
      "previous": "前のページ",
      "next": "次のページ",
      "page": "ページに移動",
      "first": "最初のページに移動",
      "last": "最後のページに移動"
    }
  },
  'ko': {
    "paging": {
      "previous": "이전",
      "next": "다음",
      "page": "페이지",
      "of": "의",
      "first": "처음",
      "last": "마지막",
      "showing": "표시 중",
      "to": "에서",
      "ofTotal": "총",
      "items": "개",
      "pages": "페이지"
    },
    "aria": {
      "pagination": "페이지네이션",
      "previous": "이전 페이지",
      "next": "다음 페이지",
      "page": "페이지로 이동",
      "first": "첫 페이지로 이동",
      "last": "마지막 페이지로 이동"
    }
  }
};

// 产品详情页面的翻译数据
const productDetailTranslations = {
  'en': {
    "breadcrumb": {
      "home": "Home",
      "products": "Products"
    },
    "product": {
      "advantages": "Product Advantages",
      "advantages_list": [
        "High efficiency and energy saving, excellent performance",
        "Easy operation and convenient maintenance",
        "Compact structure and strong applicability",
        "Reliable quality and perfect service"
      ],
      "contact_us": "Contact Us",
      "share_to": "Share to:",
      "details": "Product Details",
      "specifications": "Technical Specifications",
      "features": "Product Features",
      "applications": "Applications",
      "applications_text": "Widely used in construction sites, municipal engineering, road construction, landscaping, warehousing and logistics and many other fields. With its excellent performance and reliability, it provides efficient solutions for various engineering projects."
    },
    "navigation": {
      "previous_product": "Previous Product",
      "next_product": "Next Product"
    },
    "form": {
      "title": "Leave Your Message",
      "name": "Name",
      "name_placeholder": "Enter your name",
      "telephone": "Telephone",
      "telephone_placeholder": "Enter your telephone",
      "email": "Email",
      "email_placeholder": "Enter your email",
      "email_required": "Required",
      "message": "Consultation Content",
      "message_placeholder": "Products you are interested in",
      "captcha": "Verification Code",
      "send": "Send"
    },
    "related": {
      "products": "Related Products",
      "news": "Related News",
      "recommended": "Recommended Products",
      "view_more": "View More Products",
      "contact_now": "Contact Now",
      "get_quote": "Get detailed quotes and technical specifications"
    }
  },
  'zh-hans': {
    "breadcrumb": {
      "home": "首页",
      "products": "产品中心"
    },
    "product": {
      "advantages": "产品优势",
      "advantages_list": [
        "高效节能，性能卓越",
        "操作简便，维护方便",
        "结构紧凑，适用性强",
        "品质可靠，服务完善"
      ],
      "contact_us": "联系我们",
      "share_to": "分享到：",
      "details": "产品详情",
      "specifications": "技术参数",
      "features": "产品特点",
      "applications": "应用场景",
      "applications_text": "广泛应用于建筑工地、市政工程、道路建设、园林绿化、仓储物流等多个领域。凭借其出色的性能和可靠性，为各类工程项目提供高效的解决方案。"
    },
    "navigation": {
      "previous_product": "上一个产品",
      "next_product": "下一个产品"
    },
    "form": {
      "title": "留言咨询",
      "name": "姓名",
      "name_placeholder": "请输入姓名",
      "telephone": "电话",
      "telephone_placeholder": "请输入电话",
      "email": "邮箱",
      "email_placeholder": "请输入邮箱",
      "email_required": "必填",
      "message": "咨询内容",
      "message_placeholder": "您感兴趣的产品",
      "captcha": "验证码",
      "send": "发送"
    },
    "related": {
      "products": "相关产品",
      "news": "相关新闻",
      "recommended": "推荐产品",
      "view_more": "查看更多产品",
      "contact_now": "立即联系",
      "get_quote": "获取详细报价和技术参数"
    }
  }
};

// 生成翻译文件
function generateTranslationFiles() {
  const localesDir = path.join(__dirname, '../src/locales');
  
  // 生成分页翻译文件
  Object.entries(translations).forEach(([lang, translation]) => {
    const langDir = path.join(localesDir, lang);
    const paginationPath = path.join(langDir, 'pagination.json');
    
    // 创建语言目录
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    // 写入分页翻译文件
    fs.writeFileSync(paginationPath, JSON.stringify(translation, null, 2), 'utf8');
    console.log(`✅ 已生成 ${lang}/pagination.json`);
  });
  
  // 生成产品详情翻译文件
  Object.entries(productDetailTranslations).forEach(([lang, translation]) => {
    const langDir = path.join(localesDir, lang);
    const productDetailPath = path.join(langDir, 'product-detail.json');
    
    // 创建语言目录
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    // 写入产品详情翻译文件
    fs.writeFileSync(productDetailPath, JSON.stringify(translation, null, 2), 'utf8');
    console.log(`✅ 已生成 ${lang}/product-detail.json`);
  });
}

generateTranslationFiles(); 