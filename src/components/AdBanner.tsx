// src/components/AdBanner.tsx
import { useEffect, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

const AdBanner = () => {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    try {
      // Check if adsbygoogle exists
      if (!window.adsbygoogle) return;

      window.adsbygoogle.push({});
      // Only mark ad as visible after pushing
      setShowAd(true);
    } catch (e) {
      console.error("Adsense push error:", e);
      setShowAd(false);
    }
  }, []);

  // Don't render anything if ad is not visible
  if (!showAd) return null;

  return (
    <ins
      className="adsbygoogle block w-full h-[90px]"
      style={{ display: "block" }}
      data-ad-client="ca-pub-1805122572208587"
      data-ad-slot="5068460354"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdBanner;
