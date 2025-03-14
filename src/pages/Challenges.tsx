
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import CreateChallengeForm from "@/components/challenges/CreateChallengeForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ads/AdSlot";
import { Challenge } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Challenges = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [userParticipatingIn, setUserParticipatingIn] = useState<string[]>([]);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select('*');
          
        if (error) {
          console.error('Error fetching challenges:', error);
          return;
        }
        
        if (data) {
          setChallenges(data);
          
          // Determine which challenges the user is participating in
          if (user) {
            const { data: participations, error: participationsError } = await supabase
              .from('challenge_participants')
              .select('challenge_id')
              .eq('user_id', user.id);
              
            if (participationsError) {
              console.error('Error fetching challenge participations:', participationsError);
            } else if (participations) {
              setUserParticipatingIn(participations.map(p => p.challenge_id));
            }
          }
        }
      } catch (err) {
        console.error('Error in challenges fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenges();
  }, [user]);

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  const completedChallenges = challenges.filter(c => c.status === 'completed');
    
  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to join challenges",
      });
      return;
    }
    
    try {
      // Insert participation record
      const { error } = await supabase
        .from('challenge_participants')
        .insert({ 
          challenge_id: challengeId,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error joining challenge:', error);
        toast({
          variant: "destructive",
          title: "Failed to Join",
          description: "Could not join the challenge. Please try again.",
        });
        return;
      }
      
      // Update local state
      setUserParticipatingIn(prev => [...prev, challengeId]);
      
      toast({
        title: "Challenge Joined",
        description: "You've successfully joined the challenge!",
      });
    } catch (err) {
      console.error('Error in join challenge:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Challenges</h1>
          <CreateChallengeForm />
        </div>
        
        <AdSlot slotId="challenges-banner" className="mb-2 mx-auto" />
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitscore-500"></div>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {activeChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active challenges</p>
                </div>
              ) : (
                activeChallenges.map(challenge => (
                  <ChallengeCard 
                    key={challenge.id}
                    challenge={challenge}
                    isParticipating={userParticipatingIn.includes(challenge.id)}
                    onJoin={() => handleJoinChallenge(challenge.id)}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming challenges</p>
                </div>
              ) : (
                upcomingChallenges.map(challenge => (
                  <ChallengeCard 
                    key={challenge.id}
                    challenge={challenge}
                    isParticipating={userParticipatingIn.includes(challenge.id)}
                    onJoin={() => handleJoinChallenge(challenge.id)}
                  />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedChallenges.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No completed challenges</p>
                </div>
              ) : (
                completedChallenges.map(challenge => (
                  <ChallengeCard 
                    key={challenge.id}
                    challenge={challenge}
                    isParticipating={userParticipatingIn.includes(challenge.id)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MobileLayout>
  );
};

export default Challenges;
