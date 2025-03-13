
import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import LeaderboardItem from "@/components/leaderboard/LeaderboardItem";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { mockLeaderboard } from "@/utils/mockData";

const Leaderboard = () => {
  const [leaderboard] = useState(mockLeaderboard);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredLeaderboard = searchQuery
    ? leaderboard.filter(entry => 
        entry.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leaderboard;

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Leaderboard</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-center">
          <h3 className="font-semibold">Your Rank</h3>
          <div className="text-3xl font-bold text-fitscore-600 my-1">
            {leaderboard.find(entry => entry.user_id === "current-user")?.rank || "N/A"}
          </div>
          <p className="text-sm text-muted-foreground">
            Keep going! You're close to the top.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users" 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            {filteredLeaderboard.map(entry => (
              <LeaderboardItem 
                key={entry.user_id}
                entry={entry}
                isCurrentUser={entry.user_id === "current-user"}
              />
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Leaderboard;
