
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdSlot } from "@/contexts/AdsContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AdSettingsTab = () => {
  const { toast } = useToast();
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdSlots = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('ad_slots').select('*');
        
        if (error) {
          console.error('Error fetching ad slots:', error);
          toast({
            variant: "destructive",
            title: "Failed to load ad slots",
            description: error.message,
          });
        } else if (data) {
          setAdSlots(data as AdSlot[]);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          variant: "destructive",
          title: "An unexpected error occurred",
          description: "Could not load ad settings",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdSlots();
  }, [toast]);

  const handleAdCodeChange = (id: string, adCode: string) => {
    setAdSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.id === id ? { ...slot, adCode } : slot
      )
    );
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    setAdSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.id === id ? { ...slot, isActive } : slot
      )
    );
  };

  const handleSaveChanges = async (id: string) => {
    const slotToUpdate = adSlots.find(slot => slot.id === id);
    
    if (slotToUpdate) {
      try {
        const { error } = await supabase
          .from('ad_slots')
          .upsert({ 
            id: slotToUpdate.id,
            name: slotToUpdate.name,
            description: slotToUpdate.description,
            adCode: slotToUpdate.adCode,
            isActive: slotToUpdate.isActive
          });
        
        if (error) {
          console.error('Error updating ad slot:', error);
          toast({
            variant: "destructive",
            title: "Save failed",
            description: error.message,
          });
        } else {
          toast({
            title: "Ad slot updated",
            description: `"${slotToUpdate.name}" has been updated successfully.`,
          });
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          variant: "destructive",
          title: "An unexpected error occurred",
          description: "Could not save ad settings",
        });
      }
    }
  };

  const handleSaveAll = async () => {
    try {
      const { error } = await supabase.from('ad_slots').upsert(adSlots);
      
      if (error) {
        console.error('Error updating all ad slots:', error);
        toast({
          variant: "destructive",
          title: "Save failed",
          description: error.message,
        });
      } else {
        toast({
          title: "All ad slots updated",
          description: "All ad slots have been saved successfully.",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "An unexpected error occurred",
        description: "Could not save ad settings",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fitscore-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Advertisement Settings</h2>
        <Button onClick={handleSaveAll}>
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ad Slot Management</CardTitle>
          <CardDescription>
            Configure the advertisement slots displayed throughout the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {adSlots.map((slot) => (
              <AccordionItem key={slot.id} value={slot.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{slot.name}</span>
                    <div className="flex items-center">
                      <Switch 
                        id={`active-${slot.id}`}
                        checked={slot.isActive}
                        onCheckedChange={(checked) => handleToggleActive(slot.id, checked)}
                        className="mr-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className={`text-sm ${slot.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {slot.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <label htmlFor={`description-${slot.id}`} className="text-sm font-medium">
                        Description
                      </label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Location where this ad will appear in the app</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id={`description-${slot.id}`}
                      value={slot.description}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <label htmlFor={`adcode-${slot.id}`} className="text-sm font-medium">
                        Ad Code
                      </label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Paste HTML ad code from your ad network (like Google AdSense, etc.)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      id={`adcode-${slot.id}`}
                      value={slot.adCode}
                      onChange={(e) => handleAdCodeChange(slot.id, e.target.value)}
                      rows={6}
                      placeholder="Paste your ad code here..."
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSaveChanges(slot.id)}
                      size="sm"
                    >
                      Save Changes
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ad Guidelines</CardTitle>
          <CardDescription>Best practices for ad placement</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Use appropriately sized ad units for mobile and desktop views</li>
            <li>Ensure ads do not disrupt the user experience</li>
            <li>Consider using responsive ad units when possible</li>
            <li>Test ads across different devices to ensure proper rendering</li>
            <li>Monitor ad performance to optimize placement and revenue</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdSettingsTab;
