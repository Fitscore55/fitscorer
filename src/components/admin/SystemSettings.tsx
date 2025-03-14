
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FitscoreSettings from "./FitscoreSettings";
import AdSettingsTab from "./AdSettingsTab";

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
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic application configuration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="appName" className="text-sm font-medium">
                      Application Name
                    </label>
                    <Input
                      id="appName"
                      name="appName"
                      value={settings.appName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="stepsPerCoin" className="text-sm font-medium">
                      Steps Required Per Coin
                    </label>
                    <Input
                      id="stepsPerCoin"
                      name="stepsPerCoin"
                      type="number"
                      value={settings.stepsPerCoin}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of steps a user needs to take to earn 1 coin.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label htmlFor="maintenanceMode" className="text-sm font-medium">
                          Maintenance Mode
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Temporarily disable the app for maintenance.
                        </p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => handleToggle('maintenanceMode', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Settings</CardTitle>
                  <CardDescription>Enable or disable app features.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="enableChallenges" className="text-sm font-medium">
                        Challenges
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Allow users to create and participate in challenges.
                      </p>
                    </div>
                    <Switch
                      id="enableChallenges"
                      checked={settings.enableChallenges}
                      onCheckedChange={(checked) => handleToggle('enableChallenges', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="enableWallet" className="text-sm font-medium">
                        Wallet
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Enable the coin wallet system for rewards.
                      </p>
                    </div>
                    <Switch
                      id="enableWallet"
                      checked={settings.enableWallet}
                      onCheckedChange={(checked) => handleToggle('enableWallet', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="enableLeaderboard" className="text-sm font-medium">
                        Leaderboard
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Show user rankings and competitive features.
                      </p>
                    </div>
                    <Switch
                      id="enableLeaderboard"
                      checked={settings.enableLeaderboard}
                      onCheckedChange={(checked) => handleToggle('enableLeaderboard', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Legal Settings</CardTitle>
                  <CardDescription>Update legal documents and policies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="privacyPolicy" className="text-sm font-medium">
                      Privacy Policy
                    </label>
                    <Textarea
                      id="privacyPolicy"
                      name="privacyPolicy"
                      value={settings.privacyPolicy}
                      onChange={handleChange}
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="termsOfService" className="text-sm font-medium">
                      Terms of Service
                    </label>
                    <Textarea
                      id="termsOfService"
                      name="termsOfService"
                      value={settings.termsOfService}
                      onChange={handleChange}
                      rows={5}
                    />
                  </div>
                </CardContent>
              </Card>
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
