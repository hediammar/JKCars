import { useState, useEffect, useRef, useCallback } from "react";

interface VideoLoaderProps {
  onVideoEnd: () => void;
}

export default function VideoLoader({ onVideoEnd }: VideoLoaderProps) {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleEnded = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onVideoEnd();
    }, 800);
  }, [onVideoEnd]);

  const handleError = useCallback(() => {
    console.log("Video failed to load, skipping loader");
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onVideoEnd();
    }, 300);
  }, [onVideoEnd]);

  // Function to play video
  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setNeedsInteraction(false);
    } catch (error) {
      console.log("Autoplay prevented");
      setNeedsInteraction(true);
    }
  }, []);

  // Handle click on container to start video
  const handleContainerClick = useCallback(() => {
    if (needsInteraction) {
      playVideo();
    }
  }, [needsInteraction, playVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video properties for autoplay
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.defaultMuted = true;

    // Handle when video can play
    const handleCanPlay = () => {
      playVideo();
    };

    // Handle when video is loaded enough
    const handleLoadedData = () => {
      playVideo();
    };

    // Handle when video starts playing
    const handlePlaying = () => {
      setNeedsInteraction(false);
    };

    // Try to play on any user interaction
    const handleUserInteraction = () => {
      if (video.paused) {
        playVideo();
      }
    };

    // Add event listeners
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    // Add user interaction listeners for autoplay
    const interactionEvents = ["click", "touchstart", "keydown", "mousedown", "scroll", "wheel"];
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    // Try to load and play immediately
    video.load();
    
    // Multiple attempts to play
    const timeout1 = setTimeout(() => playVideo(), 100);
    const timeout2 = setTimeout(() => playVideo(), 500);
    playVideo(); // Immediate attempt

    // Fallback: if still not playing after 2 seconds, show interaction needed
    const fallbackTimeout = setTimeout(() => {
      if (video.paused) {
        setNeedsInteraction(true);
      }
    }, 2000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(fallbackTimeout);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [playVideo, handleEnded, handleError]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-800 ease-in-out ${
        isFading ? "opacity-0" : "opacity-100"
      } ${needsInteraction ? "cursor-pointer" : ""}`}
      style={{ transitionDuration: "800ms" }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
        preload="auto"
        loop={false}
        disablePictureInPicture
        controls={false}
        onLoadedData={playVideo}
        onCanPlay={playVideo}
      >
        <source src="/assets/intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {needsInteraction && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-lg font-medium">Click to play intro</p>
          </div>
        </div>
      )}
    </div>
  );
}

