// src/components/AdBanner.tsx
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

const AdBanner = () => {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (e) {
      console.error("Adsense push error:", e);
    }
  }, []);

  return (
    <div className="my-4 text-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "90px" }}
        data-ad-client="ca-pub-1805122572208587" // your real Publisher ID
        data-ad-slot="5068460354"               // your real Ad Slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;
