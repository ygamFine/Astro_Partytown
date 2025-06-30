#!/bin/bash

# 图片优化脚本 - 只压缩，绝不裁剪
# 保持原始尺寸和比例，只减少文件大小

echo "开始优化Banner图片（保持原始尺寸）..."

# 检查是否安装了imagemagick
if ! command -v magick &> /dev/null; then
    echo "错误: 需要安装ImageMagick"
    echo "macOS: brew install imagemagick"
    echo "Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# 创建优化后的图片目录
mkdir -p public/images/optimized

# 优化Banner图片 - 只压缩，保持原始尺寸
echo "优化 banner3.jpg（保持原始尺寸）..."
magick public/images/banner3.jpg -quality 85 -strip public/images/optimized/banner3.jpg

echo "优化 banner222.jpg（保持原始尺寸）..."
magick public/images/banner222.jpg -quality 85 -strip public/images/optimized/banner222.jpg

echo "优化 banner.jpg（保持原始尺寸）..."
magick public/images/banner.jpg -quality 85 -strip public/images/optimized/banner.jpg

# 创建WebP版本（保持原始尺寸）
echo "创建WebP版本（保持原始尺寸）..."
magick public/images/banner3.jpg -quality 80 -strip public/images/optimized/banner3.webp
magick public/images/banner222.jpg -quality 80 -strip public/images/optimized/banner222.webp
magick public/images/banner.jpg -quality 80 -strip public/images/optimized/banner.webp

# 显示文件大小对比
echo "文件大小对比:"
echo "原始文件:"
ls -lh public/images/banner*.jpg | awk '{print $9 ": " $5}'

echo "优化后文件:"
ls -lh public/images/optimized/banner*.jpg | awk '{print $9 ": " $5}'

echo "WebP文件:"
ls -lh public/images/optimized/banner*.webp | awk '{print $9 ": " $5}'

echo ""
echo "✅ 图片优化完成！"
echo "✅ 保持了原始尺寸和比例"
echo "✅ 只进行了压缩，没有任何裁剪"
echo "✅ 可以安全使用优化后的图片" 