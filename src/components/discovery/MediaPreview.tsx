import { useEffect, useRef, useState } from 'react';
import { getVideoLinkStatus, isRenderableMediaUrl, normalizeMediaUrl } from '@/helpers/media-url.ts';
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
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const normalizedMediaUrl = normalizeMediaUrl(mediaUrl);
  const isRenderableUrl = isRenderableMediaUrl(normalizedMediaUrl);
  const videoStatus = getVideoLinkStatus(normalizedMediaUrl);

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
  }, [contentType, normalizedMediaUrl, variant]);

  useEffect(() => {
    setVideoFailed(false);
    setImageFailed(false);
  }, [contentType, normalizedMediaUrl, variant]);

  const wrapperClass = variant === 'tile'
    ? 'w-full h-full'
    : 'w-full h-56 overflow-hidden bg-tg-card';

  if (contentType === 'text') {
    const textSnippet = text?.trim() || 'Text preview';
    return (
      <div className={`${wrapperClass} bg-gradient-to-br from-[#385f86] via-[#274B67] to-[#1A2733] px-5`}>
        <div className="flex h-full items-center justify-center py-5">
          <p className="line-clamp-5 break-words text-center text-[18px] font-extrabold leading-[1.24] text-white drop-shadow-sm [overflow-wrap:anywhere]">
            {textSnippet}
          </p>
        </div>
      </div>
    );
  }

  if (!normalizedMediaUrl || !isRenderableUrl) {
    return (
      <div className={`${wrapperClass} flex items-center justify-center p-4 bg-tg-input`}>
        <p className="text-sm text-tg-muted text-center">Preview unavailable</p>
      </div>
    );
  }

  if (contentType === 'video') {
    const showVideoFallback = videoStatus === 'page' || videoFailed;
    if (showVideoFallback) {
      return (
        <div className={`${wrapperClass} flex items-center justify-center p-4 bg-tg-input`}>
          <p className="text-sm text-tg-muted text-center">Use a direct .mp4/.webm video URL</p>
        </div>
      );
    }

    if (variant === 'tile') {
      return (
        <video className={wrapperClass} muted loop playsInline autoPlay preload="metadata" onError={() => setVideoFailed(true)}>
          <source src={normalizedMediaUrl} />
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
          onError={() => setVideoFailed(true)}
        >
          <source src={normalizedMediaUrl} />
        </video>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
          {isPaused ? 'Play' : 'Pause'}
        </span>
      </button>
    );
  }

  if (imageFailed) {
    return (
      <div className={`${wrapperClass} flex items-center justify-center p-4 bg-tg-input`}>
        <p className="text-sm text-tg-muted text-center">Preview unavailable</p>
      </div>
    );
  }

  return <img className={wrapperClass} src={normalizedMediaUrl} alt="" onError={() => setImageFailed(true)} />;
};
