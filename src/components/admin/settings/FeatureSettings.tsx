
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface FeatureSettingsProps {
  settings: {
    enableChallenges: boolean;
    enableWallet: boolean;
    enableLeaderboard: boolean;
  };
  handleToggle: (name: string, value: boolean) => void;
}

const FeatureSettings = ({ settings, handleToggle }: FeatureSettingsProps) => {
  return (
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
  );
};

export default FeatureSettings;
