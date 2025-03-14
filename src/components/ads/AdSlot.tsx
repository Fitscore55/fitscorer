
import React, { useEffect, useRef } from 'react';
import { useAds } from '@/contexts/AdsContext';
import { Card } from '@/components/ui/card';

interface AdSlotProps {
  slotId: string;
  className?: string;
}

const AdSlot = ({ slotId, className = '' }: AdSlotProps) => {
  const { getAdBySlotId, isLoading } = useAds();
  const adRef = useRef<HTMLDivElement>(null);
  const adSlot = getAdBySlotId(slotId);

  useEffect(() => {
    if (adRef.current && adSlot?.adCode && adSlot.isActive) {
      // Clear previous content
      adRef.current.innerHTML = '';
      
      // Insert new ad code
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = adSlot.adCode;
      
      // Append each child node to prevent script execution issues
      while (tempDiv.firstChild) {
        adRef.current.appendChild(tempDiv.firstChild);
      }
      
      // Execute any scripts if needed
      const scripts = adRef.current.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        const scriptClone = document.createElement('script');
        
        // Copy all attributes
        Array.from(script.attributes).forEach(attr => {
          scriptClone.setAttribute(attr.name, attr.value);
        });
        
        // Copy inline script content
        scriptClone.text = script.text;
        
        // Replace the original script with the clone
        script.parentNode?.replaceChild(scriptClone, script);
      }
    }
  }, [adSlot, isLoading]);

  if (isLoading) {
    return null;
  }

  if (!adSlot || !adSlot.isActive) {
    return null;
  }

  return (
    <Card className={`p-2 overflow-hidden ${className}`}>
      <div ref={adRef} className="ad-container w-full h-full" />
    </Card>
  );
};

export default AdSlot;
