
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AdSlot = {
  id: string;
  name: string;
  description: string;
  adCode: string;
  isActive: boolean;
};

type AdsContextType = {
  adSlots: AdSlot[];
  isLoading: boolean;
  getAdBySlotId: (slotId: string) => AdSlot | undefined;
};

const defaultAdSlots: AdSlot[] = [
  {
    id: 'home-top',
    name: 'Home Page Top',
    description: 'Top of the home dashboard',
    adCode: '',
    isActive: true,
  },
  {
    id: 'challenges-banner',
    name: 'Challenges Banner',
    description: 'Banner in challenges page',
    adCode: '',
    isActive: true,
  },
  {
    id: 'leaderboard-footer',
    name: 'Leaderboard Footer',
    description: 'Footer of the leaderboard page',
    adCode: '',
    isActive: true,
  },
  {
    id: 'wallet-banner',
    name: 'Wallet Banner',
    description: 'Banner in wallet page',
    adCode: '',
    isActive: true,
  },
  {
    id: 'profile-footer',
    name: 'Profile Footer',
    description: 'Footer of the profile page',
    adCode: '',
    isActive: true,
  }
];

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export const AdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adSlots, setAdSlots] = useState<AdSlot[]>(defaultAdSlots);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdSlots = async () => {
      try {
        console.log('Fetching ad slots from Supabase...');
        // Use type assertion to bypass TypeScript type checking
        const { data, error } = await supabase
          .from('ad_slots' as any)
          .select('*');

        if (error) {
          console.error('Error fetching ad slots:', error);
          // If there's an error, use defaults
          setAdSlots(defaultAdSlots);
        } else if (data && data.length > 0) {
          // If we have data, transform it to match our AdSlot type
          const transformedData = data.map((slot: any) => ({
            id: slot.id,
            name: slot.name,
            description: slot.description,
            adCode: slot.adcode || '', // Handle lowercase field name from DB
            isActive: slot.isactive || true, // Handle lowercase field name from DB
          }));
          setAdSlots(transformedData);
          console.log('Ad slots loaded:', transformedData);
        } else {
          console.log('No ad slots found in database, using defaults');
          // If the table exists but is empty, initialize with defaults
          for (const slot of defaultAdSlots) {
            await supabase.from('ad_slots' as any).upsert({
              id: slot.id,
              name: slot.name,
              description: slot.description,
              adcode: slot.adCode,
              isactive: slot.isActive
            });
          }
          setAdSlots(defaultAdSlots);
        }
      } catch (error) {
        console.error('Error setting up ad slots:', error);
        setAdSlots(defaultAdSlots);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdSlots();
  }, []);

  const getAdBySlotId = (slotId: string) => {
    return adSlots.find(slot => slot.id === slotId);
  };

  return (
    <AdsContext.Provider value={{ adSlots, isLoading, getAdBySlotId }}>
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdsContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};
