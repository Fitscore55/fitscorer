
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, Trophy, Star, MessageSquare, Calendar, Activity } from "lucide-react";

const notificationFormSchema = z.object({
  pushEnabled: z.boolean().default(true),
  emailEnabled: z.boolean().default(true),
  challenges: z.boolean().default(true),
  achievements: z.boolean().default(true),
  messages: z.boolean().default(true),
  reminders: z.boolean().default(true),
  activityUpdates: z.boolean().default(true),
  marketingUpdates: z.boolean().default(false),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

// This simulates saved user preferences
const defaultValues: NotificationFormValues = {
  pushEnabled: true,
  emailEnabled: true,
  challenges: true,
  achievements: true,
  messages: true,
  reminders: true,
  activityUpdates: true,
  marketingUpdates: false,
};

const NotificationSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues,
  });

  function onSubmit(data: NotificationFormValues) {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(data);
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
      setIsLoading(false);
    }, 1000);
  }

  const notificationTypes = [
    { name: "challenges", label: "Challenges", icon: Trophy, description: "New challenges and invitations" },
    { name: "achievements", label: "Achievements", icon: Star, description: "When you earn badges and achievements" },
    { name: "messages", label: "Messages", icon: MessageSquare, description: "Messages from friends and trainers" },
    { name: "reminders", label: "Reminders", icon: Calendar, description: "Workout and challenge reminders" },
    { name: "activityUpdates", label: "Activity Updates", icon: Activity, description: "Activity goals and summaries" },
    { name: "marketingUpdates", label: "Marketing", icon: Bell, description: "Promotional offers and updates" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>
              Choose how you want to receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="pushEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Push Notifications</FormLabel>
                    <FormDescription>
                      Receive notifications on your device.
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
            <FormField
              control={form.control}
              name="emailEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Email Notifications</FormLabel>
                    <FormDescription>
                      Receive notifications via email.
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Select which types of notifications you want to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationTypes.map((type) => (
              <FormField
                key={type.name}
                control={form.control}
                name={type.name as keyof NotificationFormValues}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-3">
                      <type.icon className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <FormLabel>{type.label}</FormLabel>
                        <FormDescription>
                          {type.description}
                        </FormDescription>
                      </div>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save preferences"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default NotificationSettings;
