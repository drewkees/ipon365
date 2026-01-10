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
        data-ad-client="ca-pub-XXXXXXXXXXXXXXX" // replace with your AdSense client ID
        data-ad-slot="1234567890"               // your Ad slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdBanner;
