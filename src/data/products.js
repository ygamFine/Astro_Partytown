export const products = [
  {
    id: 1,
    slug: "skid-steer-loader-s850",
    name: "滑移装载机 YN-S850",
    category: "滑移装载机",
    image: "/product1.svg",
    price: "¥ 180,000",
    excerpt: "紧凑设计，动力强劲，适用于狭窄空间作业。",
    specs: [
      { key: "额定载荷", value: "850 kg" },
      { key: "发动机功率", value: "48 kW" },
      { key: "工作重量", value: "2950 kg" },
      { key: "铲斗容量", value: "0.45 m³" },
    ],
    features: [
      "配备知名品牌洋马发动机，动力可靠。",
      "先进的液压系统，响应迅速，操作精准。",
      "符合人体工程学的驾驶室，视野开阔，舒适安全。",
      "快速更换附件系统，可搭配多种属具，一机多用。"
    ],
    gallery: ["/skid1.webp", "/skid2.webp", "/skid3.webp"]
  },
  {
    id: 2,
    slug: "backhoe-loader-b120",
    name: "挖掘装载机 YN-B120",
    category: "挖掘装载机",
    image: "/product2.svg",
    price: "¥ 350,000",
    excerpt: "一机双能，兼具挖掘与装载功能，性价比高。",
    specs: [
      { key: "额定功率", value: "82 kW" },
      { key: "最大挖掘深度", value: "4500 mm" },
      { key: "装载斗容量", value: "1.0 m³" },
      { key: "工作重量", value: "8200 kg" },
    ],
    features: [
      "四轮驱动，适应各种复杂地形。",
      "蟹行模式和平行模式，提供卓越的机动性。",
      "集成的液压管路，方便安装破碎锤等多种附件。",
      "宽敞的空调驾驶室，提供全天候舒适工作环境。"
    ],
    gallery: ["/backhoe.webp", "/skid4.webp", "/skid5.webp"]
  },
  {
    id: 3,
    slug: "telescopic-handler-t3500",
    name: "伸缩臂叉装车 YN-T3500",
    category: "伸缩臂叉装车",
    image: "/product3.svg",
    price: "¥ 420,000",
    excerpt: "超长臂展，高空作业的理想选择。",
    specs: [
      { key: "最大起升高度", value: "17 m" },
      { key: "最大起重量", value: "3500 kg" },
      { key: "发动机功率", value: "74 kW" },
      { key: "整机重量", value: "10500 kg" },
    ],
    features: [
      "三级伸缩臂设计，作业范围广。",
      "智能载荷管理系统，确保作业安全。",
      "多种转向模式（前轮、四轮、蟹行），适应不同场地需求。",
      "快速更换平台、吊钩、铲斗等多种附件。"
    ],
    gallery: ["/telescopic.webp", "/skid-main.webp", "/factory.webp"]
  },
  {
    id: 4,
    slug: "electric-loader-e50",
    name: "电动装载机 YN-E50",
    category: "电动工程机械",
    image: "/main-product.svg",
    price: "¥ 580,000",
    excerpt: "零排放，低噪音，引领绿色施工新时代。",
    specs: [
      { key: "电池容量", value: "282 kWh" },
      { key: "额定载荷", value: "5000 kg" },
      { key: "充电时间", value: "1.5 小时 (快充)" },
      { key: "续航时间", value: "8-10 小时" },
    ],
    features: [
        "采用宁德时代高性能磷酸铁锂电池，安全可靠。",
        "永磁同步电机，效率高达95%以上。",
        "整车能量回收系统，有效延长续航里程。",
        "智能化电池管理系统（BMS），实时监控电池状态。"
    ],
    gallery: ["/product1.svg", "/product2.svg", "/product3.svg"]
  }
]; 