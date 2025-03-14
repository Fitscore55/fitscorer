
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import LeaderboardItem from "@/components/leaderboard/LeaderboardItem";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AdSlot from "@/components/ads/AdSlot";
import { LeaderboardEntry } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('fitscore', { ascending: false });
          
        if (error) {
          console.error('Error fetching leaderboard:', error);
          return;
        }
        
        if (data) {
          // Add rank to each entry based on the order
          const rankedData = data.map((entry, index) => ({
            ...entry,
            rank: index + 1
          })) as LeaderboardEntry[];
          
          setLeaderboard(rankedData);
        }
      } catch (err) {
        console.error('Error in leaderboard fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);
  
  const filteredLeaderboard = searchQuery
    ? leaderboard.filter(entry => 
        entry.username?.toLowerCase().includes(searchQuery.toLowerCase())
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
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitscore-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLeaderboard.length > 0 ? (
                filteredLeaderboard.map(entry => (
                  <LeaderboardItem 
                    key={entry.user_id}
                    entry={entry}
                    isCurrentUser={entry.user_id === "current-user"}
                  />
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <AdSlot slotId="leaderboard-footer" className="mt-4 mx-auto" />
      </div>
    </MobileLayout>
  );
};

export default Leaderboard;
