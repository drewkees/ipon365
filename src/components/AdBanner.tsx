// src/components/AdBanner.tsx
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

const AdBanner = () => {
  const [adVisible, setAdVisible] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      // Only push if this <ins> does NOT already have an ad
      if (!(adRef.current as any).__adLoaded) {
        window.adsbygoogle.push({});
        (adRef.current as any).__adLoaded = true;
        setAdVisible(true);
      }
    } catch (e) {
      console.error("Adsense push error:", e);
      setAdVisible(false);
    }
  }, []);

  if (!adVisible) return null;

  return (
    <div ref={adRef}>
      <ins
        className="adsbygoogle block w-full h-[90px]"
        style={{ display: "block" }}
        data-ad-client="ca-pub-1805122572208587"
        data-ad-slot="5068460354"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;
