import { useEffect, useRef, useState } from 'react';
import type { ContentType } from '@/types/tondiscover.ts';

type MediaPreviewProps = {
  contentType: ContentType;
  mediaUrl?: string;
  text?: string;
  variant?: 'default' | 'tile';
};

export const MediaPreview = ({
  contentType,
  mediaUrl,
  text,
  variant = 'default',
}: MediaPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (contentType !== 'video' || variant === 'tile') {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    setIsPaused(video.paused);

    const syncPauseState = () => {
      setIsPaused(video.paused);
    };

    video.addEventListener('pause', syncPauseState);
    video.addEventListener('play', syncPauseState);

    // Keep default preview behavior: autoplay silently, allow pause by tap.
    void video.play().catch(() => undefined);

    return () => {
      video.removeEventListener('pause', syncPauseState);
      video.removeEventListener('play', syncPauseState);
    };
  }, [contentType, mediaUrl, variant]);

  const wrapperClass = variant === 'tile'
    ? 'w-full h-full'
    : 'w-full h-56 overflow-hidden bg-tg-card';

  if (contentType === 'text') {
    return (
      <div className={`${wrapperClass} flex items-center justify-center p-4 bg-gradient-to-br from-[#274B67] to-[#1A2733]`}>
        <p className="text-sm text-white text-center line-clamp-2">{text || 'Text preview'}</p>
      </div>
    );
  }

  if (!mediaUrl) {
    return (
      <div className={`${wrapperClass} flex items-center justify-center p-4 bg-tg-input`}>
        <p className="text-sm text-tg-muted text-center">Preview unavailable</p>
      </div>
    );
  }

  if (contentType === 'video') {
    if (variant === 'tile') {
      return (
        <video className={wrapperClass} muted loop playsInline autoPlay preload="metadata">
          <source src={mediaUrl} />
        </video>
      );
    }

    const togglePause = () => {
      const video = videoRef.current;
      if (!video) {
        return;
      }

      if (video.paused) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    return (
      <button
        type="button"
        className={`${wrapperClass} relative block`}
        onClick={togglePause}
        aria-label={isPaused ? 'Play video' : 'Pause video'}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          controls={false}
          disablePictureInPicture
        >
          <source src={mediaUrl} />
        </video>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
          {isPaused ? 'Play' : 'Pause'}
        </span>
      </button>
    );
  }

  return <img className={wrapperClass} src={mediaUrl} alt="" />;
};
