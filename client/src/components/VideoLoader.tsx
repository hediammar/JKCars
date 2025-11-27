import { useState, useEffect, useRef, useCallback } from "react";

interface VideoLoaderProps {
  onVideoEnd: () => void;
}

export default function VideoLoader({ onVideoEnd }: VideoLoaderProps) {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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

    // Set video properties for autoplay
    video.muted = true;
    video.playsInline = true;
    video.loop = false;
    video.preload = "auto";

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

    // Try to play the video
    const attemptPlay = async () => {
      try {
        await video.play();
      } catch (error) {
        console.log("Autoplay prevented:", error);
        // If autoplay fails, skip the video
        handleError();
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

    // Add event listeners
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    // Try to load and play
    video.load();
    attemptPlay();

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
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
