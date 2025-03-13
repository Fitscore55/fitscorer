
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const privacyFormSchema = z.object({
  profileVisibility: z.enum(["public", "friends", "private"], {
    required_error: "You need to select a visibility option.",
  }),
  activitySharing: z.boolean().default(true),
  locationSharing: z.boolean().default(false),
  showInLeaderboards: z.boolean().default(true),
  shareAchievements: z.boolean().default(true),
  allowFriendRequests: z.boolean().default(true),
  allowTagging: z.boolean().default(true),
  dataCollection: z.boolean().default(true),
});

type PrivacyFormValues = z.infer<typeof privacyFormSchema>;

// This simulates saved user preferences
const defaultValues: PrivacyFormValues = {
  profileVisibility: "public",
  activitySharing: true,
  locationSharing: false,
  showInLeaderboards: true,
  shareAchievements: true,
  allowFriendRequests: true,
  allowTagging: true,
  dataCollection: true,
};

const PrivacySettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacyFormSchema),
    defaultValues,
  });

  function onSubmit(data: PrivacyFormValues) {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(data);
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      });
      setIsLoading(false);
    }, 1000);
  }

  const privacyItems = [
    { name: "activitySharing", label: "Activity Sharing", description: "Share your workout activities" },
    { name: "locationSharing", label: "Location Sharing", description: "Allow sharing your location data" },
    { name: "showInLeaderboards", label: "Leaderboard Visibility", description: "Show your name in leaderboards" },
    { name: "shareAchievements", label: "Achievement Sharing", description: "Share your achievements with others" },
    { name: "allowFriendRequests", label: "Friend Requests", description: "Allow others to send you friend requests" },
    { name: "allowTagging", label: "Allow Tagging", description: "Allow others to tag you in challenges" },
    { name: "dataCollection", label: "Data Collection", description: "Allow FitScore to collect usage data for improvements" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Privacy</CardTitle>
            <CardDescription>
              Control who can see your profile and information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="profileVisibility"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Profile Visibility</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="public" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Public - Anyone can view your profile
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="friends" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Friends Only - Only connections can view your profile
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="private" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Private - Your profile is completely private
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    This controls who can see your profile information and activities.
                  </FormDescription>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Controls</CardTitle>
            <CardDescription>
              Manage your privacy preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {privacyItems.map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name as keyof PrivacyFormValues}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{item.label}</FormLabel>
                        <FormDescription>
                          {item.description}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save privacy settings"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default PrivacySettings;
