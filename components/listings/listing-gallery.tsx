"use client";

import { useState } from "react";
import { ImageIcon, Package, Wrench } from "lucide-react";

interface ListingGalleryProps {
  media: Array<{
    id: string;
    url: string;
    mimeType: string | null;
  }>;
  title: string;
  listingType: "item" | "service";
}

export function ListingGallery({ media, title, listingType }: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (media.length === 0) {
    return (
      <div className="aspect-video w-full rounded-xl bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)] flex flex-col items-center justify-center text-[var(--color-neutral-400)]">
        {listingType === "service" ? (
          <Wrench className="h-12 w-12 text-[var(--color-neutral-300)] mb-1.5" />
        ) : (
          <Package className="h-12 w-12 text-[var(--color-neutral-300)] mb-1.5" />
        )}
        <span className="text-xs font-medium flex items-center gap-1">
          <ImageIcon className="h-3.5 w-3.5" /> No Photos Added
        </span>
      </div>
    );
  }

  const currentImage = media[selectedIndex] || media[0];

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)] shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage.url}
          alt={`${title} - Photo ${selectedIndex + 1}`}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails if > 1 */}
      {media.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {media.map((item, index) => (
            <button
              key={item.id || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative h-16 w-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                selectedIndex === index
                  ? "border-[var(--color-primary-600)] ring-2 ring-[var(--color-primary-500)]/20"
                  : "border-[var(--color-neutral-200)] opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
