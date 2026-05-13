import { useState, useEffect } from "react";
import { fetchPlaceImage, getPlaceImageFallback } from "@/lib/place-image";

interface Props {
  name: string;
  city: string;
  tag?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Renders a place image:
 * 1. Shows a static/curated fallback immediately (no layout shift)
 * 2. Fetches a real Unsplash photo in the background
 * 3. Crossfades to the real photo when ready
 */
export function PlaceImage({ name, city, tag, alt, className = "", width = 800, height = 600 }: Props) {
  const fallback = getPlaceImageFallback(name, city, tag);
  const [src, setSrc] = useState(fallback);
  const [loaded, setLoaded] = useState(false);
  const [realSrc, setRealSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setSrc(getPlaceImageFallback(name, city, tag));

    fetchPlaceImage(name, city, tag).then((url) => {
      if (!cancelled && url !== fallback) {
        setRealSrc(url);
      }
    });
    return () => { cancelled = true; };
  }, [name, city, tag]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Fallback always visible */}
      <img
        src={src}
        alt={alt ?? name}
        width={width}
        height={height}
        className={`h-full w-full object-cover ${className}`}
        onError={(e) => {
          const t = e.currentTarget;
          if (!t.dataset.fb) {
            t.dataset.fb = "1";
            t.src = `https://loremflickr.com/800/600/${encodeURIComponent(city)}/all`;
          }
        }}
      />

      {/* Real Unsplash photo fades in on top */}
      {realSrc && (
        <img
          key={realSrc}
          src={realSrc}
          alt={alt ?? name}
          width={width}
          height={height}
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
        />
      )}
    </div>
  );
}
