
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save } from 'lucide-react';
import { useAds } from '@/contexts/AdsContext';

const AdSettingsTab = () => {
  const { toast } = useToast();
  const { adSlots, isLoading, systemEnabled, setSystemEnabled } = useAds();
  const [localAdSlots, setLocalAdSlots] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      setLocalAdSlots(adSlots.map(slot => ({
        ...slot,
        adcode: slot.adCode,
        isactive: slot.isActive
      })));
    }
  }, [adSlots, isLoading]);

  const handleToggleAdSlot = (id: string, active: boolean) => {
    setLocalAdSlots(
      localAdSlots.map(slot => 
        slot.id === id ? { ...slot, isactive: active } : slot
      )
    );
  };

  const handleToggleAdSystem = (enabled: boolean) => {
    setSystemEnabled(enabled);
  };

  const handleCodeChange = (id: string, code: string) => {
    setLocalAdSlots(
      localAdSlots.map(slot => 
        slot.id === id ? { ...slot, adcode: code } : slot
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const slot of localAdSlots) {
        const { error } = await supabase
          .from('ad_slots')
          .upsert({
            id: slot.id,
            name: slot.name,
            description: slot.description,
            adcode: slot.adcode,
            isactive: slot.isactive
          });
        
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: "Ad settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving ad slots:', error);
      toast({
        title: "Error",
        description: "Failed to save ad settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading ad settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Ad Management</h2>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* System-wide toggle */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Control the entire ad system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="adSystemEnabled" className="text-sm font-medium">
                Enable Ad System
              </label>
              <p className="text-xs text-muted-foreground">
                Toggle to enable or disable all ads across the application
              </p>
            </div>
            <Switch
              id="adSystemEnabled"
              checked={systemEnabled}
              onCheckedChange={handleToggleAdSystem}
            />
          </div>
        </CardContent>
      </Card>

      {/* Individual ad slots */}
      {localAdSlots.map((slot) => (
        <Card key={slot.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{slot.name}</CardTitle>
                <CardDescription>{slot.description}</CardDescription>
              </div>
              <Switch
                id={`active-${slot.id}`}
                checked={slot.isactive}
                onCheckedChange={(checked) => handleToggleAdSlot(slot.id, checked)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor={`code-${slot.id}`} className="text-sm font-medium">
                Ad Code
              </label>
              <Textarea
                id={`code-${slot.id}`}
                value={slot.adcode || ''}
                onChange={(e) => handleCodeChange(slot.id, e.target.value)}
                rows={5}
                placeholder="Paste ad code here..."
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Paste the ad provider code snippet for this ad slot. This may include HTML, CSS, and JavaScript.
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdSettingsTab;
