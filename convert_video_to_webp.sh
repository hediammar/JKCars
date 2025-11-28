#!/bin/bash
# Script to convert intro.mp4 to animated WebP for guaranteed autoplay on all devices
# Requires FFmpeg to be installed
# WebP has better compression than GIF while maintaining quality

echo "Converting intro.mp4 to intro.webp..."
echo "This will create an animated WebP that autoplays on all devices (including mobile)"

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: FFmpeg is not installed."
    echo "Please install FFmpeg first:"
    echo "  - Windows: Download from https://ffmpeg.org/download.html"
    echo "  - Mac: brew install ffmpeg"
    echo "  - Linux: sudo apt-get install ffmpeg"
    exit 1
fi

# Check if source file exists
if [ ! -f "client/public/assets/intro.mp4" ]; then
    echo "Error: intro.mp4 not found at client/public/assets/intro.mp4"
    exit 1
fi

# Convert to WebP with optimized settings
# - fps=30: 30 frames per second
# - scale=1920:-1: Scale to 1920px width, maintain aspect ratio
# - lossless 0: Use lossy compression for smaller file size
# - q:v 80: Quality setting (0-100, higher = better quality)
# - loop 0: Play once (no loop)
ffmpeg -i client/public/assets/intro.mp4 \
  -vf "fps=30,scale=1920:-1" \
  -c:v libwebp \
  -lossless 0 \
  -compression_level 6 \
  -q:v 80 \
  -loop 0 \
  -preset default \
  -an \
  client/public/assets/intro.webp

echo ""
echo "Conversion complete! intro.webp has been created."
echo "The VideoLoader component will automatically use it if available."

