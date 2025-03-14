
import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import CreateChallengeForm from "@/components/challenges/CreateChallengeForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockChallenges } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ads/AdSlot";

const Challenges = () => {
  const { toast } = useToast();
  const [challenges] = useState(mockChallenges);

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  const completedChallenges = challenges.filter(c => c.status === 'completed');
  
  const userParticipatingIn = challenges
    .filter(c => c.participants.some(p => p.user_id === 'current-user'))
    .map(c => c.id);
    
  const handleJoinChallenge = (challengeId: string) => {
    // In a real app, this would call an API to join the challenge
    toast({
      title: "Challenge Joined",
      description: "You've successfully joined the challenge!",
    });
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Challenges</h1>
          <CreateChallengeForm />
        </div>
        
        <AdSlot slotId="challenges-banner" className="mb-2 mx-auto" />
        
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
      </div>
    </MobileLayout>
  );
};

export default Challenges;
