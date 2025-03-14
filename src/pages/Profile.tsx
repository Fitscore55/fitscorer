
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/layout/MobileLayout";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileMenu from "@/components/profile/ProfileMenu";
import ProfileSettings from "@/components/profile/ProfileSettings";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import { Button } from "@/components/ui/button";
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
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
  
  const navigateToSection = (section: string) => {
    setActiveSection(section);
  };

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
      <div className="space-y-6 pb-24">
        {activeSection ? (
          <ProfileSettings 
            activeSection={activeSection} 
            onBack={() => setActiveSection(null)} 
          />
        ) : (
          <>
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
            
            <ProfileMenu onNavigate={navigateToSection} />
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </>
        )}
        
        <EditProfileDialog
          open={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
          profileData={profileData}
          setProfileData={setProfileData}
        />
      </div>
    </MobileLayout>
  );
};

export default Profile;
