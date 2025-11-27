import { useState, useEffect, useRef, useCallback } from "react";

interface VideoLoaderProps {
  onVideoEnd: () => void;
}

export default function VideoLoader({ onVideoEnd }: VideoLoaderProps) {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const handleEnded = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onVideoEnd();
    }, 800);
  }, [onVideoEnd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Set canvas size to match viewport
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Set video properties (don't try to play, just load)
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.preload = "auto";
    video.currentTime = 0;

    let isSeeking = false;
    const targetFPS = 30; // Target frames per second
    const frameInterval = 1000 / targetFPS;

    // Function to seek and draw frame (bypasses autoplay restrictions)
    const seekAndDraw = (targetTime: number) => {
      if (isSeeking || video.ended) return;

      // Only seek if we need to move forward significantly
      if (Math.abs(video.currentTime - targetTime) > 0.033) {
        isSeeking = true;
        video.currentTime = targetTime;

        const onSeeked = () => {
          isSeeking = false;
          if (ctx && video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
          }
          video.removeEventListener("seeked", onSeeked);
        };

        video.addEventListener("seeked", onSeeked, { once: true });
      } else if (video.readyState >= 2) {
        // Draw current frame without seeking
        ctx.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
      }
    };

    // Animation loop using requestAnimationFrame
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
        lastFrameTimeRef.current = currentTime;
      }

      const elapsed = (currentTime - startTimeRef.current) / 1000;
      const deltaTime = currentTime - lastFrameTimeRef.current;

      // Only update if enough time has passed (throttle to target FPS)
      if (deltaTime >= frameInterval) {
        if (elapsed >= video.duration) {
          // Video finished
          handleEnded();
          return;
        }

        seekAndDraw(elapsed);
        lastFrameTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation when video metadata is loaded
    const handleLoadedMetadata = () => {
      video.currentTime = 0;
      startTimeRef.current = null;
      lastFrameTimeRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Handle video ready
    const handleCanPlay = () => {
      if (video.readyState >= 2) {
        ctx.drawImage(video, 0, 0, window.innerWidth, window.innerHeight);
      }
    };

    // Error handling
    const handleError = () => {
      console.log("Video error, skipping loader");
      handleEnded();
    };

    // Add event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // Load the video (this doesn't require autoplay)
    video.load();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      video.pause();
      video.src = "";
    };
  }, [handleEnded]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-800 ease-in-out ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: "800ms" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ display: "block" }}
      />
      <video
        ref={videoRef}
        className="hidden"
        muted
        playsInline
        preload="auto"
        loop={false}
      >
        <source src="/assets/intro.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
