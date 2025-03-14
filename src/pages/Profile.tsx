
import { useState, useEffect } from "react";
import { 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type ProfileData = {
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
};

const Profile = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    email: "",
    phone: "",
    avatar_url: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, email, phone, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProfileData({
            username: data.username || "",
            email: data.email || "",
            phone: data.phone || "",
            avatar_url: data.avatar_url || "",
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Failed to load profile",
          description: "Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProfile();
  }, [user, navigate, toast]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
      });
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profileData.username,
          email: profileData.email,
          phone: profileData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setIsEditProfileOpen(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };
  
  const menuItems = [
    {
      icon: Settings,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
    {
      icon: Bell,
      label: "Notifications",
      onClick: () => navigate("/settings?tab=notifications"),
    },
    {
      icon: Shield,
      label: "Privacy",
      onClick: () => navigate("/settings?tab=privacy"),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onClick: () => navigate("/settings?tab=help"),
    },
  ];

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fitscore-500"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        
        <ProfileCard 
          username={profileData.username}
          email={profileData.email}
          phone={profileData.phone}
          avatar_url={profileData.avatar_url}
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
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={profileData.phone || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
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
              <Button type="button" onClick={handleUpdateProfile}>
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
