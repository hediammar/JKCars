# Converting Intro Video to Animated Format

If the canvas-based solution doesn't work on all browsers, you can convert the video to an animated format that will work automatically.

## Option 1: Animated GIF (Simple but larger file)

### Using FFmpeg:
```bash
ffmpeg -i intro.mp4 -vf "fps=30,scale=1920:-1:flags=lanczos" -loop 0 intro.gif
```

### Using Online Tools:
- [EZGIF Video to GIF](https://ezgif.com/video-to-gif)
- Upload your video, set FPS (30 recommended), and convert

## Option 2: Animated WebP (Better compression)

### Using FFmpeg:
```bash
ffmpeg -i intro.mp4 -vf "fps=30,scale=1920:-1" -c:v libwebp -lossless 0 -compression_level 6 -q:v 80 -loop 0 -preset default -an intro.webp
```

## Option 3: Image Sequence + CSS Animation (Best performance)

### Extract frames using FFmpeg:
```bash
ffmpeg -i intro.mp4 -vf fps=30 frames/frame_%04d.jpg
```

Then use the image sequence loader component (see `ImageSequenceLoader.tsx`)

## Option 4: Lottie Animation (Best quality/size ratio)

1. Import video into After Effects
2. Export as Lottie JSON using [Bodymovin plugin](https://github.com/airbnb/lottie-web)
3. Use `lottie-web` library to play animation

## Current Solution

The current `VideoLoader.tsx` uses a canvas-based approach that seeks through the video frame-by-frame without calling `play()`, which should bypass autoplay restrictions. This should work on most modern browsers.

If you need 100% guaranteed autoplay, convert to one of the formats above.

