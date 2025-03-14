
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LegalSettingsProps {
  settings: {
    privacyPolicy: string;
    termsOfService: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const LegalSettings = ({ settings, handleChange }: LegalSettingsProps) => {
  return (
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
  );
};

export default LegalSettings;
