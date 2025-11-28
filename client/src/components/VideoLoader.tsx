import { useState, useEffect, useRef, useCallback } from "react";

interface VideoLoaderProps {
  onVideoEnd: () => void;
}

export default function VideoLoader({ onVideoEnd }: VideoLoaderProps) {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playAttemptedRef = useRef(false);

  const handleEnded = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onVideoEnd();
    }, 800);
  }, [onVideoEnd]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video properties for autoplay (critical for mobile)
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.preload = "auto";
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("playsinline", "true");
    video.setAttribute("x5-playsinline", "true"); // For Android browsers

    const handleEnded = () => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        onVideoEnd();
      }, 800);
    };

    const handleError = () => {
      console.log("Video failed to load, skipping loader");
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        onVideoEnd();
      }, 300);
    };

    // Aggressive play attempt function
    const attemptPlay = async (retryCount = 0) => {
      if (playAttemptedRef.current && retryCount === 0) return;
      
      try {
        // Ensure video is still muted (some browsers reset this)
        video.muted = true;
        video.volume = 0;
        
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          playAttemptedRef.current = true;
          console.log("Video playing successfully");
        }
      } catch (error) {
        console.log("Autoplay attempt failed:", error);
        
        // Retry up to 3 times with increasing delays
        if (retryCount < 3) {
          setTimeout(() => {
            attemptPlay(retryCount + 1);
          }, 200 * (retryCount + 1));
        } else {
          // If all retries fail, try one more time after a short delay
          // This handles cases where the video needs more time to load
          setTimeout(() => {
            if (!playAttemptedRef.current) {
              attemptPlay(0);
            }
          }, 500);
        }
      }
    };

    // Handle when video can play
    const handleCanPlay = () => {
      attemptPlay();
    };

    // Handle when video is loaded enough
    const handleLoadedData = () => {
      attemptPlay();
    };

    // Handle when video metadata is loaded
    const handleLoadedMetadata = () => {
      attemptPlay();
    };

    // Handle when video can start playing
    const handleCanPlayThrough = () => {
      attemptPlay();
    };

    // Add event listeners
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    // Force load the video
    video.load();
    
    // Try to play immediately
    attemptPlay();

    // Also try after a small delay (helps with mobile browsers)
    const timeoutId = setTimeout(() => {
      attemptPlay();
    }, 100);

    // Fallback: try to play on any user interaction (as last resort)
    const handleUserInteraction = () => {
      if (!playAttemptedRef.current) {
        attemptPlay();
      }
    };

    // Add touch/click listeners as fallback (will be removed after first play)
    const events = ["touchstart", "touchend", "click", "mousedown"];
    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    return () => {
      clearTimeout(timeoutId);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [onVideoEnd]);

  if (!isVisible) return null;

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
        playsInline
        muted
        autoPlay
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
