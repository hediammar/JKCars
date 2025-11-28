import { useState, useEffect, useRef, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoLoaderProps {
  onVideoEnd: () => void;
}

export default function VideoLoader({ onVideoEnd }: VideoLoaderProps) {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const logoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnded = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onVideoEnd();
    }, 800);
  }, [onVideoEnd]);

  // Mobile: Show logo intro
  useEffect(() => {
    if (!isMobile) return;

    // Show logo for 2.5 seconds, then fade out
    logoTimeoutRef.current = setTimeout(() => {
      handleEnded();
    }, 2500);

    return () => {
      if (logoTimeoutRef.current) {
        clearTimeout(logoTimeoutRef.current);
      }
    };
  }, [isMobile, handleEnded]);

  // Desktop: Play video normally (muted, autoplay)
  useEffect(() => {
    if (isMobile) return;

    const video = videoRef.current;
    if (!video) return;

    // Set video properties for autoplay
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.preload = "auto";

    const handleError = () => {
      console.log("Video failed to load, skipping loader");
      handleEnded();
    };

    // Try to play the video
    const attemptPlay = async () => {
      try {
        await video.play();
      } catch (error) {
        console.log("Autoplay prevented, trying again...", error);
        // Retry after a short delay
        setTimeout(() => {
          attemptPlay();
        }, 100);
      }
    };

    const handleCanPlay = () => {
      attemptPlay();
    };

    const handleLoadedData = () => {
      attemptPlay();
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    // Load and try to play
    video.load();
    attemptPlay();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [isMobile, handleEnded]);

  if (!isVisible) return null;

  // Mobile: Show logo intro
  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-800 ease-in-out ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
        style={{ transitionDuration: "800ms" }}
      >
        <img
          src="/assets/Jkcar.png"
          alt="JK Car"
          className="max-w-[80%] max-h-[80%] object-contain animate-pulse"
          style={{
            animation: "fadeInScale 0.8s ease-out, pulse 2s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  // Desktop: Play video normally
  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-800 ease-in-out ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: "800ms" }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        autoPlay
        playsInline
        preload="auto"
        loop={false}
        disablePictureInPicture
        controls={false}
      >
        <source src="/assets/intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
