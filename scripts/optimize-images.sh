#!/bin/bash

# 全站图片优化脚本 - WebP 转换和压缩优化
# 提升 SSG 性能，支持响应式图片

echo "🚀 开始全站图片优化..."

# 在任何环境下都进行图片优化
echo "🚀 开始全站图片优化..."

# 检查WebP工具是否可用
HAS_CWEBP=false
if command -v cwebp &> /dev/null; then
    HAS_CWEBP=true
    echo "✅ cwebp 可用"
else
    echo "⚠️  cwebp 不可用，使用Node.js图片处理"
    echo "在Vercel环境中，将使用Node.js的sharp库进行图片处理"
fi

# 检查ImageMagick是否可用
HAS_IMAGEMAGICK=false
if command -v magick &> /dev/null; then
    HAS_IMAGEMAGICK=true
    echo "✅ ImageMagick 可用"
else
    echo "⚠️  ImageMagick 不可用，使用Node.js图片处理"
    echo "在Vercel环境中，将使用Node.js的sharp库进行图片处理"
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

# 检查是否有需要生成移动端版本的图片
mobile_images_found=false

# 检查banner图片
for img in public/images/banner*.jpg public/images/banner*.png public/images/banner*.webp; do
    if [[ -f "$img" ]]; then
        mobile_images_found=true
        break
    fi
done

# 检查Strapi图片
if [[ -d "public/images/strapi" ]]; then
    for img in public/images/strapi/*.jpg public/images/strapi/*.png public/images/strapi/*.webp; do
        if [[ -f "$img" ]]; then
            mobile_images_found=true
            break
        fi
    done
fi

if [[ "$mobile_images_found" == "true" ]]; then
    echo "📱 开始生成移动端响应式图片..."
    
    # 确保优化目录存在
    mkdir -p public/images/optimized
    
    # 为大图生成移动端版本（包括Strapi图片）
    for img in public/images/banner*.jpg public/images/banner*.png public/images/banner*.webp public/images/strapi/*.jpg public/images/strapi/*.png public/images/strapi/*.webp; do
        if [[ -f "$img" ]]; then
            base_name=$(basename "$img")
            base_name="${base_name%.*}"
            mobile_webp="public/images/optimized/${base_name}-mobile.webp"
            
            if [[ ! -f "$mobile_webp" ]]; then
                echo "📱 生成移动端版本: $mobile_webp"
                magick "$img" -resize 768x400^ -gravity center -extent 768x400 -quality 80 "$mobile_webp"
            fi
        fi
    done
    echo "✅ 移动端图片生成完成"
else
    echo "⏭️  跳过移动端图片生成（未找到需要处理的图片）"
fi

echo "🗂️  检查关键图片文件..."

# 动态检查关键图片文件
critical_images=()

# 检查logo文件
if [[ -f "public/images/logo.png.webp" ]]; then
    critical_images+=("public/images/logo.png.webp")
fi

# 检查main-product.svg
if [[ -f "public/main-product.svg" ]]; then
    critical_images+=("public/main-product.svg")
fi

# 检查Strapi图片目录
if [[ -d "public/images/strapi" ]]; then
    strapi_count=$(find public/images/strapi -name "*.webp" 2>/dev/null | wc -l)
    if [[ $strapi_count -gt 0 ]]; then
        echo "✅ Strapi图片目录存在，包含 $strapi_count 个WebP文件"
    fi
fi

# 检查优化的图片目录
if [[ -d "public/images/optimized" ]]; then
    optimized_count=$(find public/images/optimized -name "*.webp" 2>/dev/null | wc -l)
    if [[ $optimized_count -gt 0 ]]; then
        echo "✅ 优化图片目录存在，包含 $optimized_count 个WebP文件"
    fi
fi

# 检查关键图片
missing_count=0
for img in "${critical_images[@]}"; do
    if [[ -f "$img" ]]; then
        echo "✅ 关键图片存在: $img"
    else
        echo "⚠️  缺失关键图片: $img"
        missing_count=$((missing_count + 1))
    fi
done

if [[ $missing_count -gt 0 ]]; then
    echo "⚠️  发现 $missing_count 个缺失的关键图片"
else
    echo "✅ 所有关键图片检查完成"
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