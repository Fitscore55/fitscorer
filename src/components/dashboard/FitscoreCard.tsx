
import { Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface FitscoreCardProps {
  score: number;
  level: number;
  nextLevelScore: number;
  currentLevelScore: number;
}

const FitscoreCard = ({
  score,
  level,
  nextLevelScore,
  currentLevelScore,
}: FitscoreCardProps) => {
  const progress = ((score - currentLevelScore) / (nextLevelScore - currentLevelScore)) * 100;

  return (
    <Link to="/fitscore" className="block">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md relative overflow-hidden transition-all hover:shadow-lg hover:translate-y-[-2px]">
        <div className="absolute top-0 right-0 w-24 h-24 bg-fitscore-100 dark:bg-fitscore-900/20 rounded-bl-3xl" />
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Activity className="w-5 h-5 mr-2 text-fitscore-600" />
            Fitscore
          </h3>
          <div className="z-10 bg-fitscore-600 text-white px-2.5 py-1 rounded-full text-xs font-medium">
            Level {level}
          </div>
        </div>
        
        <div className="flex items-baseline mb-2">
          <span className="text-3xl font-bold mr-2">{score}</span>
          <span className="text-sm text-muted-foreground">points</span>
        </div>
        
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>{currentLevelScore}</span>
          <span>{nextLevelScore}</span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <p className="text-xs text-muted-foreground mt-3">
          {Math.round(nextLevelScore - score)} points to level {level + 1}
        </p>
      </div>
    </Link>
  );
};

export default FitscoreCard;
