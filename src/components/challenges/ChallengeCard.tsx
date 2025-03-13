
import { Trophy, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Challenge } from "@/types";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: Challenge;
  isParticipating?: boolean;
  onJoin?: () => void;
}

const ChallengeCard = ({ 
  challenge, 
  isParticipating = false,
  onJoin 
}: ChallengeCardProps) => {
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const getStatusBadge = () => {
    const now = new Date();
    
    if (now < startDate) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Upcoming
        </Badge>
      );
    } else if (now > endDate) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Active
        </Badge>
      );
    }
  };

  // Calculate the current progress for the user
  const userProgress = isParticipating 
    ? (challenge.participants.find(p => p.user_id === "current-user")?.current_progress || 0) 
    : 0;
    
  const progressPercentage = (userProgress / challenge.goal_value) * 100;
  
  return (
    <Card className={cn(
      "p-4 relative overflow-hidden transition-all duration-200",
      isParticipating ? "border-l-4 border-fitscore-600" : ""
    )}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{challenge.name}</h3>
        {getStatusBadge()}
      </div>
      
      <div className="flex items-center text-sm text-muted-foreground mb-1">
        <Trophy className="w-4 h-4 mr-1" />
        <span>
          {challenge.goal_type === 'steps' ? 'Steps: ' : 'Distance: '}
          {challenge.goal_value.toLocaleString()} 
          {challenge.goal_type === 'distance' ? ' km' : ''}
        </span>
      </div>
      
      <div className="flex items-center text-sm text-muted-foreground mb-1">
        <Calendar className="w-4 h-4 mr-1" />
        <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
      </div>
      
      <div className="flex items-center text-sm text-muted-foreground mb-3">
        <Users className="w-4 h-4 mr-1" />
        <span>{challenge.participants.length} / {challenge.max_participants} participants</span>
      </div>

      {isParticipating && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Your progress</span>
            <span>{userProgress.toLocaleString()} / {challenge.goal_value.toLocaleString()}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm font-medium">
          <span className="text-fitscore-600">{challenge.stake_amount}</span> coins stake
        </div>
        
        {!isParticipating && (
          <Button size="sm" onClick={onJoin}>
            Join Challenge
          </Button>
        )}
        
        {isParticipating && (
          <Button size="sm" variant="outline">
            View Details
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ChallengeCard;
