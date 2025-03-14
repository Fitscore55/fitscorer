
import React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface GeneralSystemSettingsProps {
  settings: {
    appName: string;
    stepsPerCoin: number;
    maintenanceMode: boolean;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleToggle: (name: string, value: boolean) => void;
}

const GeneralSystemSettings = ({ settings, handleChange, handleToggle }: GeneralSystemSettingsProps) => {
  return (
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
  );
};

export default GeneralSystemSettings;
