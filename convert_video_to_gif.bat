@echo off
REM Script to convert intro.mp4 to animated GIF for guaranteed autoplay on all devices
REM Requires FFmpeg to be installed

echo Converting intro.mp4 to intro.gif...
echo This will create an animated GIF that autoplays on all devices (including mobile)

REM Check if source file exists
if not exist "client\public\assets\intro.mp4" (
    echo Error: intro.mp4 not found at client\public\assets\intro.mp4
    pause
    exit /b 1
)

REM Convert to GIF with optimized settings
REM - fps=30: 30 frames per second
REM - scale=1920:-1: Scale to 1920px width, maintain aspect ratio
REM - flags=lanczos: High-quality scaling
REM - loop 0: Play once (no loop)
ffmpeg -i client\public\assets\intro.mp4 -vf "fps=30,scale=1920:-1:flags=lanczos" -loop 0 client\public\assets\intro.gif

if %errorlevel% neq 0 (
    echo.
    echo Error: FFmpeg conversion failed.
    echo Please make sure FFmpeg is installed and in your PATH.
    echo Download FFmpeg from: https://ffmpeg.org/download.html
    pause
    exit /b 1
)

echo.
echo Conversion complete! intro.gif has been created.
echo The VideoLoader component will automatically use it if available.
pause

