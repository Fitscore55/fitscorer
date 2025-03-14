
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FitscoreSettings from "./FitscoreSettings";
import AdSettingsTab from "./AdSettingsTab";
import GeneralSystemSettings from "./settings/GeneralSystemSettings";
import FeatureSettings from "./settings/FeatureSettings";
import LegalSettings from "./settings/LegalSettings";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    appName: "FitScore",
    stepsPerCoin: 1000,
    enableChallenges: true,
    enableWallet: true,
    enableLeaderboard: true,
    maintenanceMode: false,
    privacyPolicy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc vitae nisl.",
    termsOfService: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc vitae nisl.",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleToggle = (name: string, value: boolean) => {
    setSettings({ ...settings, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to backend
    console.log("Settings saved:", settings);
    // You could show a toast notification here
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="fitscore">Fitscore Levels</TabsTrigger>
          <TabsTrigger value="ads">Ad Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">System Settings</h2>
            <Button type="submit" form="settings-form">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>

          <form id="settings-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GeneralSystemSettings 
                settings={settings} 
                handleChange={handleChange} 
                handleToggle={handleToggle} 
              />

              <FeatureSettings 
                settings={settings} 
                handleToggle={handleToggle} 
              />

              <LegalSettings 
                settings={settings} 
                handleChange={handleChange} 
              />
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="fitscore">
          <FitscoreSettings />
        </TabsContent>

        <TabsContent value="ads">
          <AdSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
