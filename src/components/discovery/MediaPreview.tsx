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
  const wrapperClass = variant === 'tile'
    ? 'w-full h-full'
    : 'w-full h-56 rounded-2xl overflow-hidden border border-tg-border bg-tg-card';

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

    return (
      <video className={wrapperClass} controls preload="none">
        <source src={mediaUrl} />
      </video>
    );
  }

  return <img className={wrapperClass} src={mediaUrl} alt="" />;
};
