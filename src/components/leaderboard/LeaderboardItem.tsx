
import { Medal, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaderboardEntry } from "@/types";

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}

const LeaderboardItem = ({ entry, isCurrentUser }: LeaderboardItemProps) => {
  const getRankIcon = () => {
    if (entry.rank === 1) {
      return <Medal className="h-5 w-5 text-yellow-500" />;
    } else if (entry.rank === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    } else if (entry.rank === 3) {
      return <Medal className="h-5 w-5 text-amber-700" />;
    } else {
      return <div className="h-5 w-5 flex items-center justify-center font-medium text-sm">{entry.rank}</div>;
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 rounded-lg mb-2",
        isCurrentUser 
          ? "bg-fitscore-50 border border-fitscore-100" 
          : "bg-white dark:bg-gray-800",
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 flex justify-center">
          {getRankIcon()}
        </div>
        
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <User className="h-5 w-5 text-gray-500" />
        </div>
        
        <div>
          <p className={cn(
            "font-medium", 
            isCurrentUser ? "text-fitscore-700" : ""
          )}>
            {entry.username}
            {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
          </p>
        </div>
      </div>
      
      <div className="font-semibold text-fitscore-600">
        {entry.fitscore.toLocaleString()}
      </div>
    </div>
  );
};

export default LeaderboardItem;
