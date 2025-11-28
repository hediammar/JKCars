# Video Autoplay Solution for Mobile Devices

## Problem
Mobile browsers (iOS Safari, Chrome on Android, etc.) have strict autoplay policies that prevent videos from autoplaying, even when muted. This is a security and data-saving feature.

## Solution
We've implemented a **multi-layered approach** that ensures the intro video plays automatically on all devices:

### 1. Canvas-Based Video Playback (Current Implementation)
The `VideoLoader` component uses a canvas-based approach that:
- Loads the video in a hidden element
- Seeks through the video frame-by-frame without calling `play()`
- Draws each frame to a canvas element
- **Bypasses autoplay restrictions** because we never trigger the play() method

This should work on most modern browsers, but some mobile browsers may still block video seeking.

### 2. Animated GIF/WebP Fallback (Recommended for 100% Compatibility)
For **guaranteed autoplay on all devices**, convert your video to an animated format:

#### Option A: Animated WebP (Recommended)
- Better compression than GIF
- Smaller file size
- Good quality
- **Runs the conversion script:**
  ```bash
  # Windows
  convert_video_to_webp.bat
  
  # Mac/Linux
  chmod +x convert_video_to_webp.sh
  ./convert_video_to_webp.sh
  ```

#### Option B: Animated GIF
- Universal compatibility
- Larger file size than WebP
- **Runs the conversion script:**
  ```bash
  # Windows
  convert_video_to_gif.bat
  
  # Mac/Linux
  chmod +x convert_video_to_gif.sh
  ./convert_video_to_gif.sh
  ```

## How It Works

The `VideoLoader` component automatically:
1. **Checks for animated image files** (`intro.webp` or `intro.gif`)
2. **If found**: Uses the animated image (guaranteed autoplay)
3. **If not found**: Falls back to canvas-based video playback

## Requirements

To convert videos, you need **FFmpeg** installed:

### Windows
1. Download from: https://ffmpeg.org/download.html
2. Extract and add to PATH, or place `ffmpeg.exe` in the project root

### Mac
```bash
brew install ffmpeg
```

### Linux
```bash
sudo apt-get install ffmpeg
```

## Testing

1. **Test the canvas approach first** (current implementation)
   - Should work on most devices
   - If it doesn't work on your Android device, proceed to step 2

2. **Convert to animated format** (guaranteed to work)
   - Run one of the conversion scripts
   - The component will automatically detect and use the animated image
   - Test on your Android device - it should autoplay immediately

## File Locations

- Video file: `client/public/assets/intro.mp4`
- Animated WebP (after conversion): `client/public/assets/intro.webp`
- Animated GIF (after conversion): `client/public/assets/intro.gif`

## Notes

- **Animated GIF/WebP files are larger** than the original video, but they guarantee autoplay
- The component prioritizes WebP over GIF (better compression)
- If neither animated format exists, it falls back to canvas-based video
- The animated image approach is the **most reliable** solution for mobile autoplay

