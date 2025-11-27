import { useState, useEffect, useRef } from "react";

interface VideoLoaderProps {
  onVideoEnd: () => void;
}

export default function VideoLoader({ onVideoEnd }: VideoLoaderProps) {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video is ready to play
    const handleCanPlay = () => {
      video.play().catch((error) => {
        console.log("Autoplay prevented:", error);
        // If autoplay fails, try playing on user interaction
        const playOnInteraction = () => {
          video.play();
          document.removeEventListener("click", playOnInteraction);
          document.removeEventListener("touchstart", playOnInteraction);
        };
        document.addEventListener("click", playOnInteraction);
        document.addEventListener("touchstart", playOnInteraction);
      });
    };

    const handleEnded = () => {
      setIsFading(true);
      // Wait for fade animation to complete before hiding
      setTimeout(() => {
        setIsVisible(false);
        onVideoEnd();
      }, 800); // Match fade-out duration
    };

    const handleError = () => {
      // If video fails to load, skip the loader
      console.log("Video failed to load, skipping loader");
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        onVideoEnd();
      }, 300);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    // Try to play immediately
    handleCanPlay();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
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
      >
        <source src="/assets/intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

