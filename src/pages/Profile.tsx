
import { useState } from "react";
import { 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight
} from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import ProfileCard from "@/components/profile/ProfileCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };
  
  const menuItems = [
    {
      icon: Settings,
      label: "Settings",
      onClick: () => toast({ title: "Settings", description: "Settings page coming soon." }),
    },
    {
      icon: Bell,
      label: "Notifications",
      onClick: () => toast({ title: "Notifications", description: "Notification settings coming soon." }),
    },
    {
      icon: Shield,
      label: "Privacy",
      onClick: () => toast({ title: "Privacy", description: "Privacy settings coming soon." }),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onClick: () => toast({ title: "Help", description: "Help center coming soon." }),
    },
  ];

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        
        <ProfileCard 
          username="FitUser123"
          email="user@example.com"
          phone="+1 (234) 567-8901"
          onEditProfile={() => setIsEditProfileOpen(true)}
        />
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {menuItems.map((item, index) => (
            <div key={item.label}>
              <button
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={item.onClick}
              >
                <div className="flex items-center">
                  <item.icon className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              {index < menuItems.length - 1 && <Separator />}
            </div>
          ))}
        </div>
        
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
        
        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <input
                  id="username"
                  defaultValue="FitUser123"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <input
                  id="email"
                  defaultValue="user@example.com"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <input
                  id="phone"
                  defaultValue="+1 (234) 567-8901"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Share Fitness Data</Label>
                  <div className="text-xs text-muted-foreground">
                    Show your fitness data on leaderboards
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => {
                setIsEditProfileOpen(false);
                toast({
                  title: "Profile Updated",
                  description: "Your profile has been updated successfully.",
                });
              }}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
};

export default Profile;
