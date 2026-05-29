'use client';

import Image from 'next/image';
import { extractYoutubeVideoId, youtubeEmbedUrl } from '@/lib/youtube';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductMediaProps {
  youtubeUrl?: string;
  imageUrls?: string[];
  productName: string;
}

export function ProductMedia({ youtubeUrl, imageUrls = [], productName }: ProductMediaProps) {
  const videoId = extractYoutubeVideoId(youtubeUrl);
  const images = imageUrls.filter(Boolean);
  const [activeImage, setActiveImage] = useState(0);

  if (!videoId && images.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl md:text-2xl font-semibold text-white">Demo sản phẩm</h2>

      {videoId && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card/70">
          <div className="relative aspect-video w-full">
            <iframe
              src={youtubeEmbedUrl(videoId)}
              title={`Video demo — ${productName}`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-card/60">
            <Image
              src={images[activeImage] ?? images[0]}
              alt={`${productName} — ảnh ${activeImage + 1}`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 720px"
              unoptimized
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-colors',
                    activeImage === index
                      ? 'border-primary/50 ring-2 ring-primary/20'
                      : 'border-white/10 opacity-70 hover:opacity-100',
                  )}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
