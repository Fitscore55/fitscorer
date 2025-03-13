
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Users, 
  Eye, 
  EyeOff, 
  BarChart, 
  Map, 
  Trash2 
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PrivacySettings = () => {
  const { toast } = useToast();
  const [privacy, setPrivacy] = useState({
    profileVisibility: "all",
    showInLeaderboard: true,
    shareActivity: true,
    locationSharing: "none",
    analyticsConsent: true,
    allowFriendRequests: true,
    useBiometrics: true
  });

  const handleToggle = (name: string, checked: boolean) => {
    setPrivacy({
      ...privacy,
      [name]: checked
    });
  };

  const handleChange = (name: string, value: any) => {
    setPrivacy({
      ...privacy,
      [name]: value
    });
  };

  const handleSave = () => {
    // In a real app, save settings to the database
    console.log("Saving privacy settings:", privacy);
    toast({
      title: "Privacy Settings Saved",
      description: "Your privacy preferences have been updated successfully.",
    });
  };

  const handleDeleteAccount = () => {
    // In a real app, handle account deletion
    toast({
      variant: "destructive",
      title: "Account Deletion Requested",
      description: "Your account deletion request has been submitted.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Privacy</CardTitle>
          <CardDescription>
            Control who can see your profile and activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profileVisibility">Profile Visibility</Label>
            <Select 
              value={privacy.profileVisibility} 
              onValueChange={(value) => handleChange("profileVisibility", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="friends">Friends only</SelectItem>
                <SelectItem value="none">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Allow Friend Requests</h3>
                <p className="text-sm text-muted-foreground">
                  Let others send you friend requests
                </p>
              </div>
            </div>
            <Switch 
              checked={privacy.allowFriendRequests} 
              onCheckedChange={(checked) => handleToggle("allowFriendRequests", checked)} 
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Show in Leaderboards</h3>
                <p className="text-sm text-muted-foreground">
                  Include your profile in public leaderboards
                </p>
              </div>
            </div>
            <Switch 
              checked={privacy.showInLeaderboard} 
              onCheckedChange={(checked) => handleToggle("showInLeaderboard", checked)} 
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Share Activity</h3>
                <p className="text-sm text-muted-foreground">
                  Share your activity with friends
                </p>
              </div>
            </div>
            <Switch 
              checked={privacy.shareActivity} 
              onCheckedChange={(checked) => handleToggle("shareActivity", checked)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Privacy</CardTitle>
          <CardDescription>
            Manage how your data is used and collected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locationSharing">Location Sharing</Label>
            <Select 
              value={privacy.locationSharing} 
              onValueChange={(value) => handleChange("locationSharing", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select location sharing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Always</SelectItem>
                <SelectItem value="using">While using the app</SelectItem>
                <SelectItem value="none">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Analytics Consent</h3>
                <p className="text-sm text-muted-foreground">
                  Allow anonymous usage data collection to improve the app
                </p>
              </div>
            </div>
            <Switch 
              checked={privacy.analyticsConsent} 
              onCheckedChange={(checked) => handleToggle("analyticsConsent", checked)} 
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <EyeOff className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Biometric Login</h3>
                <p className="text-sm text-muted-foreground">
                  Use face or fingerprint to log in
                </p>
              </div>
            </div>
            <Switch 
              checked={privacy.useBiometrics} 
              onCheckedChange={(checked) => handleToggle("useBiometrics", checked)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanent actions that cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">Save Changes</Button>
    </div>
  );
};

export default PrivacySettings;
