
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, Trophy, Star, MessageSquare, Calendar, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-medium">Notification Channels</h3>
          </div>
          
          <Card className="p-4 space-y-4">
            <FormField
              control={form.control}
              name="pushEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0">
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
            
            <Separator />
            
            <FormField
              control={form.control}
              name="emailEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0">
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
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <h3 className="text-lg font-medium">Notification Types</h3>
          </div>
          
          <Card className="p-4 space-y-4">
            <NotificationTypeItem
              control={form.control}
              name="challenges"
              icon={<Trophy className="h-5 w-5" />}
              label="Challenges"
              description="New challenges and invitations"
            />
            
            <Separator />
            
            <NotificationTypeItem
              control={form.control}
              name="achievements"
              icon={<Star className="h-5 w-5" />}
              label="Achievements"
              description="When you earn badges and achievements"
            />
            
            <Separator />
            
            <NotificationTypeItem
              control={form.control}
              name="messages"
              icon={<MessageSquare className="h-5 w-5" />}
              label="Messages"
              description="Messages from friends and trainers"
            />
            
            <Separator />
            
            <NotificationTypeItem
              control={form.control}
              name="reminders"
              icon={<Calendar className="h-5 w-5" />}
              label="Reminders"
              description="Workout and challenge reminders"
            />
            
            <Separator />
            
            <NotificationTypeItem
              control={form.control}
              name="activityUpdates"
              icon={<Activity className="h-5 w-5" />}
              label="Activity Updates"
              description="Activity goals and summaries"
            />
            
            <Separator />
            
            <NotificationTypeItem
              control={form.control}
              name="marketingUpdates"
              icon={<Bell className="h-5 w-5" />}
              label="Marketing"
              description="Promotional offers and updates"
            />
          </Card>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </form>
    </Form>
  );
};

interface NotificationTypeItemProps {
  control: any;
  name: keyof NotificationFormValues;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const NotificationTypeItem = ({ control, name, icon, label, description }: NotificationTypeItemProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">{icon}</div>
            <div className="space-y-0.5">
              <FormLabel>{label}</FormLabel>
              <FormDescription>{description}</FormDescription>
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
  );
};

export default NotificationSettings;
