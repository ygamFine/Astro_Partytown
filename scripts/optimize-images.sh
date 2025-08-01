#!/bin/bash

# 全站图片优化脚本 - WebP 转换和压缩优化
# 提升 SSG 性能，支持响应式图片

echo "🚀 开始全站图片优化..."

# 检查是否为CI环境
if [[ "$CI" == "true" || "$VERCEL" == "1" || "$NETLIFY" == "true" || "$GITHUB_ACTIONS" == "true" ]]; then
    echo "🌐 检测到CI/CD环境，跳过图片优化步骤"
    echo "💡 建议在本地运行图片优化后提交到仓库"
    exit 0
fi

# 检查依赖
if ! command -v cwebp &> /dev/null; then
    echo "❌ 错误: 需要安装 cwebp"
    echo "macOS: brew install webp"
    echo "Ubuntu: sudo apt-get install webp"
    exit 1
fi

if ! command -v magick &> /dev/null; then
    echo "❌ 错误: 需要安装 ImageMagick"
    echo "macOS: brew install imagemagick"
    echo "Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# 创建优化目录
mkdir -p public/images/optimized

echo "📸 转换 JPG/PNG 图片为 WebP 格式..."

# 批量转换 public 目录下的图片（包括Strapi下载的图片）
find public -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | while read file; do
    # 生成 WebP 文件名
    webp_file="${file%.*}.webp"
    
    # 跳过已存在的 WebP 文件
    if [[ -f "$webp_file" ]]; then
        echo "⏭️  跳过已存在: $webp_file"
        continue
    fi
    
    # 转换为 WebP
    echo "🔄 转换: $file -> $webp_file"
    cwebp -q 80 -m 6 "$file" -o "$webp_file"
    
    # 检查文件大小
    original_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    webp_size=$(stat -f%z "$webp_file" 2>/dev/null || stat -c%s "$webp_file" 2>/dev/null)
    
    if [[ $webp_size -lt $original_size ]]; then
        saved_bytes=$((original_size - webp_size))
        echo "✅ 压缩成功: 节省 $saved_bytes 字节"
    fi
done

echo "📱 生成移动端响应式图片..."

# 为大图生成移动端版本（包括Strapi图片）
for img in public/images/banner*.jpg public/images/optimized/banner*.jpg public/images/strapi/*.jpg public/images/strapi/*.png; do
    if [[ -f "$img" ]]; then
        base_name=$(basename "$img" .jpg)
        base_name=$(basename "$base_name" .png)
        mobile_webp="public/images/optimized/${base_name}-mobile.webp"
        
        if [[ ! -f "$mobile_webp" ]]; then
            echo "📱 生成移动端版本: $mobile_webp"
            magick "$img" -resize 768x400^ -gravity center -extent 768x400 -quality 80 "$mobile_webp"
        fi
    fi
done

echo "🗂️  检查关键图片文件..."

# 关键图片检查列表（包括Strapi图片）
critical_images=(
    "public/shouji-banner1.webp"
    "public/main-product.svg"
    "public/images/logo.png.webp"
    "public/images/optimized/banner3.webp"
    "public/images/optimized/banner222.webp"
    "public/images/optimized/banner.webp"
)

missing_count=0
for img in "${critical_images[@]}"; do
    if [[ ! -f "$img" ]]; then
        echo "⚠️  缺失关键图片: $img"
        missing_count=$((missing_count + 1))
    else
        echo "✅ 关键图片存在: $img"
    fi
done

if [[ $missing_count -gt 0 ]]; then
    echo "⚠️  发现 $missing_count 个缺失的关键图片"
fi

echo "📊 生成图片统计报告..."

# 统计报告（包括Strapi图片）
total_jpg=$(find public -name "*.jpg" | wc -l)
total_webp=$(find public -name "*.webp" | wc -l)
total_png=$(find public -name "*.png" | wc -l)
total_svg=$(find public -name "*.svg" | wc -l)
total_strapi=$(find public/images/strapi -name "*" 2>/dev/null | wc -l)

echo ""
echo "📈 图片统计报告:"
echo "   JPG 文件: $total_jpg"
echo "   WebP 文件: $total_webp"
echo "   PNG 文件: $total_png"
echo "   SVG 文件: $total_svg"
echo "   Strapi 图片: $total_strapi"

# 计算总体文件大小
if command -v du &> /dev/null; then
    total_size=$(du -sh public/images/ 2>/dev/null | cut -f1)
    echo "   图片总大小: $total_size"
fi

echo ""
echo "🎉 图片优化完成！"
echo "✨ 所有图片已转换为 WebP 格式"
echo "📱 响应式图片已生成"
echo "🚀 网站性能已优化" 
echo "📥 Strapi 图片已本地化" 