
import React, { useEffect, useRef } from 'react';
import { useAds } from '@/contexts/AdsContext';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface AdSlotProps {
  slotId: string;
  className?: string;
}

const AdSlot = ({ slotId, className = '' }: AdSlotProps) => {
  const { getAdBySlotId, isLoading } = useAds();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const adRef = useRef<HTMLDivElement>(null);
  const adSlot = getAdBySlotId(slotId);
  
  // Check if current path is an admin page
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Don't display ads for admin users or on admin pages
    if (isAdmin || isAdminPage) {
      return;
    }

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
  }, [adSlot, isLoading, isAdmin, isAdminPage]);

  // Don't render anything for admin users or on admin pages
  if (isLoading || isAdmin || isAdminPage) {
    return null;
  }

  if (!adSlot || !adSlot.isActive) {
    return null;
  }

  // Show placeholder if ad code is empty or just contains placeholder text
  const isPlaceholder = !adSlot.adCode || adSlot.adCode.includes('Ad Space');
  
  return (
    <Card className={`${className} ${isPlaceholder ? 'border-2 border-dashed border-gray-300' : ''}`}>
      {isPlaceholder ? (
        <div className="p-4 flex items-center justify-center h-full min-h-[100px] text-gray-500 text-sm">
          <div className="text-center">
            <div className="font-semibold mb-1">{adSlot.name}</div>
            <div>Ad Placeholder ({slotId})</div>
            <div className="text-xs mt-1 text-gray-400">{adSlot.description}</div>
          </div>
        </div>
      ) : (
        <div ref={adRef} className="ad-container w-full h-full" />
      )}
    </Card>
  );
};

export default AdSlot;
