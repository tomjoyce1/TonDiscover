import type { ContentType } from '@/types/tondiscover.ts';

type MediaPreviewProps = {
  contentType: ContentType;
  mediaUrl?: string;
  text?: string;
};

export const MediaPreview = ({ contentType, mediaUrl, text }: MediaPreviewProps) => {
  if (contentType === 'text') {
    return (
      <div className="td-media td-media-text">
        {text || 'Text preview'}
      </div>
    );
  }

  if (!mediaUrl) {
    return (
      <div className="td-media td-media-fallback">
        Preview unavailable
      </div>
    );
  }

  if (contentType === 'video') {
    return (
      <video className="td-media" controls preload="none" poster="">
        <source src={mediaUrl} />
      </video>
    );
  }

  return <img className="td-media" src={mediaUrl} alt="" />;
};
