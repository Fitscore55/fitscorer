
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileCardProps {
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  onEditProfile: () => void;
}

const ProfileCard = ({
  username,
  email,
  phone,
  avatar_url,
  onEditProfile,
}: ProfileCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
      <div className="flex flex-col items-center">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarImage src={avatar_url} alt={username} />
          <AvatarFallback className="bg-fitscore-100 text-fitscore-700">
            <User className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-xl font-bold mb-1">{username}</h2>
        <p className="text-sm text-muted-foreground mb-4">{email}</p>
        
        {phone && (
          <p className="text-sm text-muted-foreground mb-4">{phone}</p>
        )}
        
        <Button 
          variant="outline"
          onClick={onEditProfile}
          className="w-full"
        >
          Edit Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;
