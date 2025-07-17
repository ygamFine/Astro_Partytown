import fs from 'fs';
import path from 'path';

// 所有支持的语言
const SUPPORTED_LANGUAGES = [
  'en', 'zh-CN', 'zh-Hant', 'ja', 'ko', 'vi', 'th', 'ms', 'id', 'my',
  'hi', 'ml', 'ar', 'tr', 'ru', 'de', 'fr', 'es', 'it', 'pt-pt', 'nl', 'pl'
];

// 各语言的翻译模板
const translations = {
  'en': {
    "breadcrumb": {
      "home": "Home",
      "cases": "Customer Cases"
    },
    "case": {
      "title": "Customer Cases",
      "description": "Discover how our machinery solutions have helped customers achieve success across various industries",
      "view_case": "View Case",
      "case_details": "Case Details",
      "customer_info": "Customer Information",
      "project_overview": "Project Overview",
      "challenges": "Challenges",
      "solutions": "Solutions",
      "results": "Results",
      "testimonials": "Customer Testimonials",
      "industry": "Industry",
      "location": "Location",
      "completion_date": "Completion Date",
      "equipment_used": "Equipment Used",
      "project_duration": "Project Duration"
    },
    "navigation": {
      "previous_case": "Previous Case",
      "next_case": "Next Case",
      "back_to_cases": "Back to Cases"
    },
    "pagination": {
      "showing": "Showing",
      "to": "to",
      "of": "of",
      "cases": "cases",
      "pages": "pages"
    },
    "related": {
      "cases": "Related Cases",
      "news": "Related News",
      "view_more": "View More"
    },
    "sidebar": {
      "related_cases": "Related Cases",
      "categories": "Categories",
      "latest_cases": "Latest Cases"
    }
  },
  'zh-CN': {
    "breadcrumb": {
      "home": "首页",
      "cases": "客户案例"
    },
    "case": {
      "title": "客户案例",
      "description": "了解我们的机械设备解决方案如何帮助客户在各个行业取得成功",
      "view_case": "查看案例",
      "case_details": "案例详情",
      "customer_info": "客户信息",
      "project_overview": "项目概述",
      "challenges": "挑战",
      "solutions": "解决方案",
      "results": "成果",
      "testimonials": "客户评价",
      "industry": "行业",
      "location": "地点",
      "completion_date": "完成日期",
      "equipment_used": "使用设备",
      "project_duration": "项目周期"
    },
    "navigation": {
      "previous_case": "上一个案例",
      "next_case": "下一个案例",
      "back_to_cases": "返回案例列表"
    },
    "pagination": {
      "showing": "显示",
      "to": "到",
      "of": "共",
      "cases": "个案例",
      "pages": "页"
    },
    "related": {
      "cases": "相关案例",
      "news": "相关新闻",
      "view_more": "查看更多"
    },
    "sidebar": {
      "related_cases": "相关案例",
      "categories": "分类",
      "latest_cases": "最新案例"
    }
  },
  'zh-Hant': {
    "breadcrumb": {
      "home": "首頁",
      "cases": "客戶案例"
    },
    "case": {
      "title": "客戶案例",
      "description": "了解我們的機械設備解決方案如何幫助客戶在各個行業取得成功",
      "view_case": "查看案例",
      "case_details": "案例詳情",
      "customer_info": "客戶信息",
      "project_overview": "項目概述",
      "challenges": "挑戰",
      "solutions": "解決方案",
      "results": "成果",
      "testimonials": "客戶評價",
      "industry": "行業",
      "location": "地點",
      "completion_date": "完成日期",
      "equipment_used": "使用設備",
      "project_duration": "項目週期"
    },
    "navigation": {
      "previous_case": "上一個案例",
      "next_case": "下一個案例",
      "back_to_cases": "返回案例列表"
    },
    "pagination": {
      "showing": "顯示",
      "to": "到",
      "of": "共",
      "cases": "個案例",
      "pages": "頁"
    },
    "related": {
      "cases": "相關案例",
      "news": "相關新聞",
      "view_more": "查看更多"
    },
    "sidebar": {
      "related_cases": "相關案例",
      "categories": "分類",
      "latest_cases": "最新案例"
    }
  },
  'ja': {
    "breadcrumb": {
      "home": "ホーム",
      "cases": "お客様事例"
    },
    "case": {
      "title": "お客様事例",
      "description": "当社の機械ソリューションが、様々な業界でお客様の成功をどのように支援しているかをご覧ください",
      "view_case": "事例を見る",
      "case_details": "事例詳細",
      "customer_info": "お客様情報",
      "project_overview": "プロジェクト概要",
      "challenges": "課題",
      "solutions": "ソリューション",
      "results": "結果",
      "testimonials": "お客様の声",
      "industry": "業界",
      "location": "所在地",
      "completion_date": "完了日",
      "equipment_used": "使用機器",
      "project_duration": "プロジェクト期間"
    },
    "navigation": {
      "previous_case": "前の事例",
      "next_case": "次の事例",
      "back_to_cases": "事例一覧に戻る"
    },
    "pagination": {
      "showing": "表示中",
      "to": "〜",
      "of": "全",
      "cases": "件の事例",
      "pages": "ページ"
    },
    "related": {
      "cases": "関連事例",
      "news": "関連ニュース",
      "view_more": "もっと見る"
    },
    "sidebar": {
      "related_cases": "関連事例",
      "categories": "カテゴリー",
      "latest_cases": "最新事例"
    }
  },
  'ko': {
    "breadcrumb": {
      "home": "홈",
      "cases": "고객 사례"
    },
    "case": {
      "title": "고객 사례",
      "description": "다양한 산업 분야에서 우리의 기계 솔루션이 고객의 성공을 어떻게 도왔는지 알아보세요",
      "view_case": "사례 보기",
      "case_details": "사례 상세",
      "customer_info": "고객 정보",
      "project_overview": "프로젝트 개요",
      "challenges": "과제",
      "solutions": "해결책",
      "results": "결과",
      "testimonials": "고객 후기",
      "industry": "산업",
      "location": "위치",
      "completion_date": "완료일",
      "equipment_used": "사용 장비",
      "project_duration": "프로젝트 기간"
    },
    "navigation": {
      "previous_case": "이전 사례",
      "next_case": "다음 사례",
      "back_to_cases": "사례 목록으로 돌아가기"
    },
    "pagination": {
      "showing": "표시 중",
      "to": "~",
      "of": "총",
      "cases": "개 사례",
      "pages": "페이지"
    },
    "related": {
      "cases": "관련 사례",
      "news": "관련 뉴스",
      "view_more": "더 보기"
    },
    "sidebar": {
      "related_cases": "관련 사례",
      "categories": "카테고리",
      "latest_cases": "최신 사례"
    }
  },
  'vi': {
    "breadcrumb": {
      "home": "Trang chủ",
      "cases": "Tình huống khách hàng"
    },
    "case": {
      "title": "Tình huống khách hàng",
      "description": "Khám phá cách các giải pháp máy móc của chúng tôi đã giúp khách hàng đạt được thành công trong nhiều ngành khác nhau",
      "view_case": "Xem tình huống",
      "case_details": "Chi tiết tình huống",
      "customer_info": "Thông tin khách hàng",
      "project_overview": "Tổng quan dự án",
      "challenges": "Thách thức",
      "solutions": "Giải pháp",
      "results": "Kết quả",
      "testimonials": "Lời chứng thực khách hàng",
      "industry": "Ngành",
      "location": "Vị trí",
      "completion_date": "Ngày hoàn thành",
      "equipment_used": "Thiết bị sử dụng",
      "project_duration": "Thời gian dự án"
    },
    "navigation": {
      "previous_case": "Tình huống trước",
      "next_case": "Tình huống tiếp theo",
      "back_to_cases": "Quay lại danh sách tình huống"
    },
    "pagination": {
      "showing": "Hiển thị",
      "to": "đến",
      "of": "trên tổng",
      "cases": "tình huống",
      "pages": "trang"
    },
    "related": {
      "cases": "Tình huống liên quan",
      "news": "Tin tức liên quan",
      "view_more": "Xem thêm"
    },
    "sidebar": {
      "related_cases": "Tình huống liên quan",
      "categories": "Danh mục",
      "latest_cases": "Tình huống mới nhất"
    }
  },
  'th': {
    "breadcrumb": {
      "home": "หน้าแรก",
      "cases": "กรณีศึกษาลูกค้า"
    },
    "case": {
      "title": "กรณีศึกษาลูกค้า",
      "description": "ค้นพบว่าโซลูชันเครื่องจักรของเราได้ช่วยลูกค้าประสบความสำเร็จในอุตสาหกรรมต่างๆ อย่างไร",
      "view_case": "ดูกรณีศึกษา",
      "case_details": "รายละเอียดกรณีศึกษา",
      "customer_info": "ข้อมูลลูกค้า",
      "project_overview": "ภาพรวมโครงการ",
      "challenges": "ความท้าทาย",
      "solutions": "โซลูชัน",
      "results": "ผลลัพธ์",
      "testimonials": "คำรับรองจากลูกค้า",
      "industry": "อุตสาหกรรม",
      "location": "สถานที่",
      "completion_date": "วันที่เสร็จสิ้น",
      "equipment_used": "อุปกรณ์ที่ใช้",
      "project_duration": "ระยะเวลาโครงการ"
    },
    "navigation": {
      "previous_case": "กรณีศึกษาก่อนหน้า",
      "next_case": "กรณีศึกษาถัดไป",
      "back_to_cases": "กลับไปยังรายการกรณีศึกษา"
    },
    "pagination": {
      "showing": "แสดง",
      "to": "ถึง",
      "of": "จาก",
      "cases": "กรณีศึกษา",
      "pages": "หน้า"
    },
    "related": {
      "cases": "กรณีศึกษาที่เกี่ยวข้อง",
      "news": "ข่าวที่เกี่ยวข้อง",
      "view_more": "ดูเพิ่มเติม"
    },
    "sidebar": {
      "related_cases": "กรณีศึกษาที่เกี่ยวข้อง",
      "categories": "หมวดหมู่",
      "latest_cases": "กรณีศึกษาล่าสุด"
    }
  },
  'ms': {
    "breadcrumb": {
      "home": "Laman Utama",
      "cases": "Kes Pelanggan"
    },
    "case": {
      "title": "Kes Pelanggan",
      "description": "Temui bagaimana penyelesaian jentera kami telah membantu pelanggan mencapai kejayaan merentasi pelbagai industri",
      "view_case": "Lihat Kes",
      "case_details": "Butiran Kes",
      "customer_info": "Maklumat Pelanggan",
      "project_overview": "Gambaran Keseluruhan Projek",
      "challenges": "Cabaran",
      "solutions": "Penyelesaian",
      "results": "Keputusan",
      "testimonials": "Testimoni Pelanggan",
      "industry": "Industri",
      "location": "Lokasi",
      "completion_date": "Tarikh Siap",
      "equipment_used": "Peralatan Digunakan",
      "project_duration": "Tempoh Projek"
    },
    "navigation": {
      "previous_case": "Kes Sebelumnya",
      "next_case": "Kes Seterusnya",
      "back_to_cases": "Kembali ke Senarai Kes"
    },
    "pagination": {
      "showing": "Menunjukkan",
      "to": "hingga",
      "of": "daripada",
      "cases": "kes",
      "pages": "halaman"
    },
    "related": {
      "cases": "Kes Berkaitan",
      "news": "Berita Berkaitan",
      "view_more": "Lihat Lagi"
    },
    "sidebar": {
      "related_cases": "Kes Berkaitan",
      "categories": "Kategori",
      "latest_cases": "Kes Terkini"
    }
  },
  'id': {
    "breadcrumb": {
      "home": "Beranda",
      "cases": "Kasus Pelanggan"
    },
    "case": {
      "title": "Kasus Pelanggan",
      "description": "Temukan bagaimana solusi mesin kami telah membantu pelanggan mencapai kesuksesan di berbagai industri",
      "view_case": "Lihat Kasus",
      "case_details": "Detail Kasus",
      "customer_info": "Informasi Pelanggan",
      "project_overview": "Gambaran Proyek",
      "challenges": "Tantangan",
      "solutions": "Solusi",
      "results": "Hasil",
      "testimonials": "Testimoni Pelanggan",
      "industry": "Industri",
      "location": "Lokasi",
      "completion_date": "Tanggal Penyelesaian",
      "equipment_used": "Peralatan yang Digunakan",
      "project_duration": "Durasi Proyek"
    },
    "navigation": {
      "previous_case": "Kasus Sebelumnya",
      "next_case": "Kasus Berikutnya",
      "back_to_cases": "Kembali ke Daftar Kasus"
    },
    "pagination": {
      "showing": "Menampilkan",
      "to": "hingga",
      "of": "dari",
      "cases": "kasus",
      "pages": "halaman"
    },
    "related": {
      "cases": "Kasus Terkait",
      "news": "Berita Terkait",
      "view_more": "Lihat Lebih Banyak"
    },
    "sidebar": {
      "related_cases": "Kasus Terkait",
      "categories": "Kategori",
      "latest_cases": "Kasus Terbaru"
    }
  },
  'my': {
    "breadcrumb": {
      "home": "ပင်မစာမျက်နှာ",
      "cases": "ဖောက်သည်ဖြစ်ရပ်များ"
    },
    "case": {
      "title": "ဖောက်သည်ဖြစ်ရပ်များ",
      "description": "ကျွန်ုပ်တို့၏စက်ယန္တရားဖြေရှင်းချက်များသည် အမျိုးမျိုးသောစက်မှုလုပ်ငန်းများတွင် ဖောက်သည်များ၏အောင်မြင်မှုကို မည်သို့ကူညီပေးခဲ့သည်ကို ရှာဖွေတွေ့ရှိပါ",
      "view_case": "ဖြစ်ရပ်ကြည့်ရန်",
      "case_details": "ဖြစ်ရပ်အသေးစိတ်",
      "customer_info": "ဖောက်သည်အချက်အလက်",
      "project_overview": "ပရောဂျက်ခြုံငုံသုံးသပ်ချက်",
      "challenges": "စိန်ခေါ်မှုများ",
      "solutions": "ဖြေရှင်းချက်များ",
      "results": "ရလဒ်များ",
      "testimonials": "ဖောက်သည်မှတ်ချက်များ",
      "industry": "စက်မှုလုပ်ငန်း",
      "location": "တည်နေရာ",
      "completion_date": "ပြီးစီးသည့်ရက်စွဲ",
      "equipment_used": "အသုံးပြုသောပစ္စည်းများ",
      "project_duration": "ပရောဂျက်ကြာချိန်"
    },
    "navigation": {
      "previous_case": "ယခင်ဖြစ်ရပ်",
      "next_case": "နောက်ထပ်ဖြစ်ရပ်",
      "back_to_cases": "ဖြစ်ရပ်စာရင်းသို့ပြန်သွားရန်"
    },
    "pagination": {
      "showing": "ပြသနေ",
      "to": "မှ",
      "of": "စုစုပေါင်း",
      "cases": "ဖြစ်ရပ်များ",
      "pages": "စာမျက်နှာများ"
    },
    "related": {
      "cases": "ဆက်စပ်ဖြစ်ရပ်များ",
      "news": "ဆက်စပ်သတင်းများ",
      "view_more": "ပိုမိုကြည့်ရန်"
    },
    "sidebar": {
      "related_cases": "ဆက်စပ်ဖြစ်ရပ်များ",
      "categories": "အမျိုးအစားများ",
      "latest_cases": "နောက်ဆုံးဖြစ်ရပ်များ"
    }
  },
  'hi': {
    "breadcrumb": {
      "home": "होम",
      "cases": "ग्राहक केस"
    },
    "case": {
      "title": "ग्राहक केस",
      "description": "जानें कि हमारे मशीनरी समाधानों ने विभिन्न उद्योगों में ग्राहकों को सफलता प्राप्त करने में कैसे मदद की है",
      "view_case": "केस देखें",
      "case_details": "केस विवरण",
      "customer_info": "ग्राहक जानकारी",
      "project_overview": "प्रोजेक्ट अवलोकन",
      "challenges": "चुनौतियां",
      "solutions": "समाधान",
      "results": "परिणाम",
      "testimonials": "ग्राहक प्रशंसापत्र",
      "industry": "उद्योग",
      "location": "स्थान",
      "completion_date": "पूर्णता दिनांक",
      "equipment_used": "उपयोग किए गए उपकरण",
      "project_duration": "प्रोजेक्ट अवधि"
    },
    "navigation": {
      "previous_case": "पिछला केस",
      "next_case": "अगला केस",
      "back_to_cases": "केस सूची पर वापस जाएं"
    },
    "pagination": {
      "showing": "दिखाया जा रहा है",
      "to": "से",
      "of": "कुल",
      "cases": "केस",
      "pages": "पेज"
    },
    "related": {
      "cases": "संबंधित केस",
      "news": "संबंधित समाचार",
      "view_more": "और देखें"
    },
    "sidebar": {
      "related_cases": "संबंधित केस",
      "categories": "श्रेणियां",
      "latest_cases": "नवीनतम केस"
    }
  },
  'ml': {
    "breadcrumb": {
      "home": "ഹോം",
      "cases": "ഉപഭോക്തൃ കേസുകൾ"
    },
    "case": {
      "title": "ഉപഭോക്തൃ കേസുകൾ",
      "description": "വിവിധ വ്യവസായങ്ങളിൽ ഉപഭോക്താക്കൾക്ക് വിജയം നേടാൻ ഞങ്ങളുടെ മെഷിനറി സൊല്യൂഷനുകൾ എങ്ങനെ സഹായിച്ചുവെന്ന് കണ്ടെത്തുക",
      "view_case": "കേസ് കാണുക",
      "case_details": "കേസ് വിശദാംശങ്ങൾ",
      "customer_info": "ഉപഭോക്തൃ വിവരങ്ങൾ",
      "project_overview": "പ്രോജക്റ്റ് അവലോകനം",
      "challenges": "വെല്ലുവിളികൾ",
      "solutions": "പരിഹാരങ്ങൾ",
      "results": "ഫലങ്ങൾ",
      "testimonials": "ഉപഭോക്തൃ സാക്ഷ്യങ്ങൾ",
      "industry": "വ്യവസായം",
      "location": "സ്ഥാനം",
      "completion_date": "പൂർത്തീകരണ തിയതി",
      "equipment_used": "ഉപയോഗിച്ച ഉപകരണങ്ങൾ",
      "project_duration": "പ്രോജക്റ്റ് കാലയളവ്"
    },
    "navigation": {
      "previous_case": "മുമ്പത്തെ കേസ്",
      "next_case": "അടുത്ത കേസ്",
      "back_to_cases": "കേസ് ലിസ്റ്റിലേക്ക് മടങ്ങുക"
    },
    "pagination": {
      "showing": "കാണിക്കുന്നു",
      "to": "മുതൽ",
      "of": "ആകെ",
      "cases": "കേസുകൾ",
      "pages": "പേജുകൾ"
    },
    "related": {
      "cases": "ബന്ധപ്പെട്ട കേസുകൾ",
      "news": "ബന്ധപ്പെട്ട വാർത്തകൾ",
      "view_more": "കൂടുതൽ കാണുക"
    },
    "sidebar": {
      "related_cases": "ബന്ധപ്പെട്ട കേസുകൾ",
      "categories": "വിഭാഗങ്ങൾ",
      "latest_cases": "ഏറ്റവും പുതിയ കേസുകൾ"
    }
  },
  'ar': {
    "breadcrumb": {
      "home": "الرئيسية",
      "cases": "حالات العملاء"
    },
    "case": {
      "title": "حالات العملاء",
      "description": "اكتشف كيف ساعدت حلول الآلات لدينا العملاء على تحقيق النجاح في مختلف الصناعات",
      "view_case": "عرض الحالة",
      "case_details": "تفاصيل الحالة",
      "customer_info": "معلومات العميل",
      "project_overview": "نظرة عامة على المشروع",
      "challenges": "التحديات",
      "solutions": "الحلول",
      "results": "النتائج",
      "testimonials": "شهادات العملاء",
      "industry": "الصناعة",
      "location": "الموقع",
      "completion_date": "تاريخ الإنجاز",
      "equipment_used": "المعدات المستخدمة",
      "project_duration": "مدة المشروع"
    },
    "navigation": {
      "previous_case": "الحالة السابقة",
      "next_case": "الحالة التالية",
      "back_to_cases": "العودة إلى قائمة الحالات"
    },
    "pagination": {
      "showing": "عرض",
      "to": "إلى",
      "of": "من",
      "cases": "حالة",
      "pages": "صفحات"
    },
    "related": {
      "cases": "الحالات ذات الصلة",
      "news": "الأخبار ذات الصلة",
      "view_more": "عرض المزيد"
    },
    "sidebar": {
      "related_cases": "الحالات ذات الصلة",
      "categories": "الفئات",
      "latest_cases": "أحدث الحالات"
    }
  },
  'tr': {
    "breadcrumb": {
      "home": "Ana Sayfa",
      "cases": "Müşteri Vakaları"
    },
    "case": {
      "title": "Müşteri Vakaları",
      "description": "Makine çözümlerimizin çeşitli endüstrilerde müşterilerin başarı elde etmesine nasıl yardımcı olduğunu keşfedin",
      "view_case": "Vakayı Görüntüle",
      "case_details": "Vaka Detayları",
      "customer_info": "Müşteri Bilgileri",
      "project_overview": "Proje Genel Bakışı",
      "challenges": "Zorluklar",
      "solutions": "Çözümler",
      "results": "Sonuçlar",
      "testimonials": "Müşteri Referansları",
      "industry": "Endüstri",
      "location": "Konum",
      "completion_date": "Tamamlanma Tarihi",
      "equipment_used": "Kullanılan Ekipman",
      "project_duration": "Proje Süresi"
    },
    "navigation": {
      "previous_case": "Önceki Vaka",
      "next_case": "Sonraki Vaka",
      "back_to_cases": "Vaka Listesine Dön"
    },
    "pagination": {
      "showing": "Gösterilen",
      "to": "ile",
      "of": "toplam",
      "cases": "vaka",
      "pages": "sayfa"
    },
    "related": {
      "cases": "İlgili Vakalar",
      "news": "İlgili Haberler",
      "view_more": "Daha Fazla Görüntüle"
    },
    "sidebar": {
      "related_cases": "İlgili Vakalar",
      "categories": "Kategoriler",
      "latest_cases": "En Son Vakalar"
    }
  },
  'ru': {
    "breadcrumb": {
      "home": "Главная",
      "cases": "Кейсы клиентов"
    },
    "case": {
      "title": "Кейсы клиентов",
      "description": "Узнайте, как наши решения в области машиностроения помогли клиентам достичь успеха в различных отраслях",
      "view_case": "Посмотреть кейс",
      "case_details": "Детали кейса",
      "customer_info": "Информация о клиенте",
      "project_overview": "Обзор проекта",
      "challenges": "Вызовы",
      "solutions": "Решения",
      "results": "Результаты",
      "testimonials": "Отзывы клиентов",
      "industry": "Отрасль",
      "location": "Местоположение",
      "completion_date": "Дата завершения",
      "equipment_used": "Используемое оборудование",
      "project_duration": "Продолжительность проекта"
    },
    "navigation": {
      "previous_case": "Предыдущий кейс",
      "next_case": "Следующий кейс",
      "back_to_cases": "Вернуться к списку кейсов"
    },
    "pagination": {
      "showing": "Показано",
      "to": "до",
      "of": "из",
      "cases": "кейсы",
      "pages": "страницы"
    },
    "related": {
      "cases": "Связанные кейсы",
      "news": "Связанные новости",
      "view_more": "Посмотреть больше"
    },
    "sidebar": {
      "related_cases": "Связанные кейсы",
      "categories": "Категории",
      "latest_cases": "Последние кейсы"
    }
  },
  'de': {
    "breadcrumb": {
      "home": "Startseite",
      "cases": "Kundenfälle"
    },
    "case": {
      "title": "Kundenfälle",
      "description": "Entdecken Sie, wie unsere Maschinenlösungen Kunden in verschiedenen Branchen zum Erfolg verholfen haben",
      "view_case": "Fall anzeigen",
      "case_details": "Fall-Details",
      "customer_info": "Kundeninformationen",
      "project_overview": "Projektübersicht",
      "challenges": "Herausforderungen",
      "solutions": "Lösungen",
      "results": "Ergebnisse",
      "testimonials": "Kundenbewertungen",
      "industry": "Branche",
      "location": "Standort",
      "completion_date": "Abschlussdatum",
      "equipment_used": "Verwendete Ausrüstung",
      "project_duration": "Projektdauer"
    },
    "navigation": {
      "previous_case": "Vorheriger Fall",
      "next_case": "Nächster Fall",
      "back_to_cases": "Zurück zur Fallliste"
    },
    "pagination": {
      "showing": "Angezeigt",
      "to": "bis",
      "of": "von",
      "cases": "Fälle",
      "pages": "Seiten"
    },
    "related": {
      "cases": "Verwandte Fälle",
      "news": "Verwandte Nachrichten",
      "view_more": "Mehr anzeigen"
    },
    "sidebar": {
      "related_cases": "Verwandte Fälle",
      "categories": "Kategorien",
      "latest_cases": "Neueste Fälle"
    }
  },
  'fr': {
    "breadcrumb": {
      "home": "Accueil",
      "cases": "Cas clients"
    },
    "case": {
      "title": "Cas clients",
      "description": "Découvrez comment nos solutions de machines ont aidé les clients à réussir dans diverses industries",
      "view_case": "Voir le cas",
      "case_details": "Détails du cas",
      "customer_info": "Informations client",
      "project_overview": "Aperçu du projet",
      "challenges": "Défis",
      "solutions": "Solutions",
      "results": "Résultats",
      "testimonials": "Témoignages clients",
      "industry": "Industrie",
      "location": "Emplacement",
      "completion_date": "Date d'achèvement",
      "equipment_used": "Équipement utilisé",
      "project_duration": "Durée du projet"
    },
    "navigation": {
      "previous_case": "Cas précédent",
      "next_case": "Cas suivant",
      "back_to_cases": "Retour à la liste des cas"
    },
    "pagination": {
      "showing": "Affichage",
      "to": "à",
      "of": "sur",
      "cases": "cas",
      "pages": "pages"
    },
    "related": {
      "cases": "Cas connexes",
      "news": "Actualités connexes",
      "view_more": "Voir plus"
    },
    "sidebar": {
      "related_cases": "Cas connexes",
      "categories": "Catégories",
      "latest_cases": "Derniers cas"
    }
  },
  'es': {
    "breadcrumb": {
      "home": "Inicio",
      "cases": "Casos de clientes"
    },
    "case": {
      "title": "Casos de clientes",
      "description": "Descubra cómo nuestras soluciones de maquinaria han ayudado a los clientes a lograr el éxito en varias industrias",
      "view_case": "Ver caso",
      "case_details": "Detalles del caso",
      "customer_info": "Información del cliente",
      "project_overview": "Resumen del proyecto",
      "challenges": "Desafíos",
      "solutions": "Soluciones",
      "results": "Resultados",
      "testimonials": "Testimonios de clientes",
      "industry": "Industria",
      "location": "Ubicación",
      "completion_date": "Fecha de finalización",
      "equipment_used": "Equipo utilizado",
      "project_duration": "Duración del proyecto"
    },
    "navigation": {
      "previous_case": "Caso anterior",
      "next_case": "Caso siguiente",
      "back_to_cases": "Volver a la lista de casos"
    },
    "pagination": {
      "showing": "Mostrando",
      "to": "a",
      "of": "de",
      "cases": "casos",
      "pages": "páginas"
    },
    "related": {
      "cases": "Casos relacionados",
      "news": "Noticias relacionadas",
      "view_more": "Ver más"
    },
    "sidebar": {
      "related_cases": "Casos relacionados",
      "categories": "Categorías",
      "latest_cases": "Casos más recientes"
    }
  },
  'it': {
    "breadcrumb": {
      "home": "Home",
      "cases": "Casi clienti"
    },
    "case": {
      "title": "Casi clienti",
      "description": "Scopri come le nostre soluzioni di macchinari hanno aiutato i clienti a raggiungere il successo in vari settori",
      "view_case": "Visualizza caso",
      "case_details": "Dettagli del caso",
      "customer_info": "Informazioni cliente",
      "project_overview": "Panoramica del progetto",
      "challenges": "Sfide",
      "solutions": "Soluzioni",
      "results": "Risultati",
      "testimonials": "Testimonianze clienti",
      "industry": "Settore",
      "location": "Posizione",
      "completion_date": "Data di completamento",
      "equipment_used": "Attrezzatura utilizzata",
      "project_duration": "Durata del progetto"
    },
    "navigation": {
      "previous_case": "Caso precedente",
      "next_case": "Caso successivo",
      "back_to_cases": "Torna all'elenco dei casi"
    },
    "pagination": {
      "showing": "Mostrando",
      "to": "a",
      "of": "di",
      "cases": "casi",
      "pages": "pagine"
    },
    "related": {
      "cases": "Casi correlati",
      "news": "Notizie correlate",
      "view_more": "Visualizza di più"
    },
    "sidebar": {
      "related_cases": "Casi correlati",
      "categories": "Categorie",
      "latest_cases": "Casi più recenti"
    }
  },
  'pt-pt': {
    "breadcrumb": {
      "home": "Início",
      "cases": "Casos de clientes"
    },
    "case": {
      "title": "Casos de clientes",
      "description": "Descubra como as nossas soluções de maquinaria ajudaram os clientes a alcançar o sucesso em várias indústrias",
      "view_case": "Ver caso",
      "case_details": "Detalhes do caso",
      "customer_info": "Informações do cliente",
      "project_overview": "Visão geral do projeto",
      "challenges": "Desafios",
      "solutions": "Soluções",
      "results": "Resultados",
      "testimonials": "Testemunhos de clientes",
      "industry": "Indústria",
      "location": "Localização",
      "completion_date": "Data de conclusão",
      "equipment_used": "Equipamento utilizado",
      "project_duration": "Duração do projeto"
    },
    "navigation": {
      "previous_case": "Caso anterior",
      "next_case": "Próximo caso",
      "back_to_cases": "Voltar à lista de casos"
    },
    "pagination": {
      "showing": "Mostrando",
      "to": "a",
      "of": "de",
      "cases": "casos",
      "pages": "páginas"
    },
    "related": {
      "cases": "Casos relacionados",
      "news": "Notícias relacionadas",
      "view_more": "Ver mais"
    },
    "sidebar": {
      "related_cases": "Casos relacionados",
      "categories": "Categorias",
      "latest_cases": "Casos mais recentes"
    }
  },
  'nl': {
    "breadcrumb": {
      "home": "Home",
      "cases": "Klantcases"
    },
    "case": {
      "title": "Klantcases",
      "description": "Ontdek hoe onze machine-oplossingen klanten hebben geholpen succes te behalen in verschillende industrieën",
      "view_case": "Case bekijken",
      "case_details": "Case details",
      "customer_info": "Klantinformatie",
      "project_overview": "Projectoverzicht",
      "challenges": "Uitdagingen",
      "solutions": "Oplossingen",
      "results": "Resultaten",
      "testimonials": "Klantgetuigenissen",
      "industry": "Industrie",
      "location": "Locatie",
      "completion_date": "Voltooiingsdatum",
      "equipment_used": "Gebruikte apparatuur",
      "project_duration": "Projectduur"
    },
    "navigation": {
      "previous_case": "Vorige case",
      "next_case": "Volgende case",
      "back_to_cases": "Terug naar caselijst"
    },
    "pagination": {
      "showing": "Toont",
      "to": "tot",
      "of": "van",
      "cases": "cases",
      "pages": "pagina's"
    },
    "related": {
      "cases": "Gerelateerde cases",
      "news": "Gerelateerd nieuws",
      "view_more": "Meer bekijken"
    },
    "sidebar": {
      "related_cases": "Gerelateerde cases",
      "categories": "Categorieën",
      "latest_cases": "Nieuwste cases"
    }
  },
  'pl': {
    "breadcrumb": {
      "home": "Strona główna",
      "cases": "Przypadki klientów"
    },
    "case": {
      "title": "Przypadki klientów",
      "description": "Odkryj, jak nasze rozwiązania maszynowe pomogły klientom osiągnąć sukces w różnych branżach",
      "view_case": "Zobacz przypadek",
      "case_details": "Szczegóły przypadku",
      "customer_info": "Informacje o kliencie",
      "project_overview": "Przegląd projektu",
      "challenges": "Wyzwania",
      "solutions": "Rozwiązania",
      "results": "Wyniki",
      "testimonials": "Opinie klientów",
      "industry": "Branża",
      "location": "Lokalizacja",
      "completion_date": "Data ukończenia",
      "equipment_used": "Użyte sprzęt",
      "project_duration": "Czas trwania projektu"
    },
    "navigation": {
      "previous_case": "Poprzedni przypadek",
      "next_case": "Następny przypadek",
      "back_to_cases": "Powrót do listy przypadków"
    },
    "pagination": {
      "showing": "Pokazuje",
      "to": "do",
      "of": "z",
      "cases": "przypadki",
      "pages": "strony"
    },
    "related": {
      "cases": "Powiązane przypadki",
      "news": "Powiązane wiadomości",
      "view_more": "Zobacz więcej"
    },
    "sidebar": {
      "related_cases": "Powiązane przypadki",
      "categories": "Kategorie",
      "latest_cases": "Najnowsze przypadki"
    }
  }
};

// 生成所有语言的翻译文件
console.log('开始生成 case.json 翻译文件...\n');

let successCount = 0;
let errorCount = 0;

for (const lang of SUPPORTED_LANGUAGES) {
  try {
    const localeDir = path.join('src', 'locales', lang);
    const filePath = path.join(localeDir, 'case.json');
    
    // 确保目录存在
    if (!fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }
    
    // 获取该语言的翻译，如果没有则使用英文
    const translation = translations[lang] || translations['en'];
    
    // 写入文件
    fs.writeFileSync(filePath, JSON.stringify(translation, null, 2), 'utf8');
    
    console.log(`✅ ${lang}/case.json - 生成成功`);
    successCount++;
  } catch (error) {
    console.error(`❌ ${lang}/case.json - 生成失败:`, error.message);
    errorCount++;
  }
}

console.log(`\n📊 生成完成统计:`);
console.log(`✅ 成功: ${successCount} 个文件`);
console.log(`❌ 失败: ${errorCount} 个文件`);
console.log(`📁 总计: ${SUPPORTED_LANGUAGES.length} 个语言`); 