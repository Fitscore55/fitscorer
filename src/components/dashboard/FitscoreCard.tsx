
import { Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LevelInfo {
  id: string;
  level: number;
  min_score: number;
  max_score: number | null;
  steps_required: number;
  distance_required: number;
  streak_days_required: number;
  rewards: string[];
  color: string;
}

interface FitscoreCardProps {
  score: number;
  level?: number;
  nextLevelScore?: number;
  currentLevelScore?: number;
}

const FitscoreCard = ({
  score,
}: FitscoreCardProps) => {
  const [currentLevelInfo, setCurrentLevelInfo] = useState<LevelInfo | null>(null);
  const [nextLevelInfo, setNextLevelInfo] = useState<LevelInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('fitscore_settings')
          .select('*')
          .order('level', { ascending: true });
        
        if (error) {
          console.error('Error fetching level info:', error);
          return;
        }
        
        if (data && data.length > 0) {
          // Find current level based on score
          const currentLevel = data.find((level, index) => 
            score >= level.min_score && 
            (index === data.length - 1 || score < data[index + 1].min_score)
          );
          
          if (currentLevel) {
            setCurrentLevelInfo(currentLevel);
            
            // Find next level (if not at max level)
            const currentLevelIndex = data.findIndex(l => l.level === currentLevel.level);
            const nextLevel = currentLevelIndex < data.length - 1 
              ? data[currentLevelIndex + 1] 
              : null;
            
            setNextLevelInfo(nextLevel);
            
            // Calculate progress to next level
            if (nextLevel) {
              const progressPercent = ((score - currentLevel.min_score) / 
                (nextLevel.min_score - currentLevel.min_score)) * 100;
              setProgress(Math.min(Math.max(progressPercent, 0), 100));
            } else {
              setProgress(100); // At max level
            }
          }
        } else {
          // Fallback for if no levels are defined
          setCurrentLevelInfo({
            id: 'default',
            level: 1,
            min_score: 0, 
            max_score: 500,
            steps_required: 5000,
            distance_required: 2,
            streak_days_required: 1,
            rewards: ['Default Badge'],
            color: 'bg-fitscore-100'
          });
        }
      } catch (err) {
        console.error('Error in Fitscore component:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, [score]);

  if (loading || !currentLevelInfo) {
    return (
      <Link to="/fitscore" className="block">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md relative overflow-hidden transition-all hover:shadow-lg hover:translate-y-[-2px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Activity className="w-5 h-5 mr-2 text-fitscore-600" />
              Fitscore
            </h3>
          </div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-24 rounded mb-4"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-2 w-full rounded mb-4"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-32 rounded"></div>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/fitscore" className="block">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md relative overflow-hidden transition-all hover:shadow-lg hover:translate-y-[-2px]">
        <div className={`absolute top-0 right-0 w-24 h-24 ${currentLevelInfo.color} dark:opacity-20 rounded-bl-3xl`} />
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Activity className="w-5 h-5 mr-2 text-fitscore-600" />
            Fitscore
          </h3>
          <div className="z-10 bg-fitscore-600 text-white px-2.5 py-1 rounded-full text-xs font-medium">
            Level {currentLevelInfo.level}
          </div>
        </div>
        
        <div className="flex items-baseline mb-2">
          <span className="text-3xl font-bold mr-2">{score}</span>
          <span className="text-sm text-muted-foreground">points</span>
        </div>
        
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>{currentLevelInfo.min_score}</span>
          <span>{nextLevelInfo?.min_score || "MAX"}</span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        {nextLevelInfo && (
          <p className="text-xs text-muted-foreground mt-3">
            {Math.round(nextLevelInfo.min_score - score)} points to level {nextLevelInfo.level}
          </p>
        )}
      </div>
    </Link>
  );
};

export default FitscoreCard;
