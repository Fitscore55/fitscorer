
import { useEffect, useState } from "react";
import { ArrowLeft, Award, FastForward, Flame, Target } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSensorData } from "@/hooks/useSensorData";

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

const Fitscore = () => {
  const { user } = useAuth();
  const { sensorData } = useSensorData();
  const [fitnessData, setFitnessData] = useState({
    steps: 0,
    distance: 0,
    fitscore: 0,
    calories: 0,
    date: new Date().toISOString()
  });
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [currentLevel, setCurrentLevel] = useState<LevelInfo | null>(null);
  const [nextLevel, setNextLevel] = useState<LevelInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Update fitness data when sensor data changes
  useEffect(() => {
    if (sensorData && Object.keys(sensorData).length > 0) {
      setFitnessData(prev => ({
        ...prev,
        steps: sensorData.steps,
        distance: sensorData.distance,
        fitscore: sensorData.fitscore,
        calories: sensorData.calories || prev.calories
      }));
    }
  }, [sensorData]);

  useEffect(() => {
    const fetchLevels = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('fitscore_settings')
          .select('*')
          .order('level', { ascending: true });
        
        if (error) {
          console.error('Error fetching fitscore levels:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setLevels(data);
          
          // Determine current level based on fitness score
          const score = fitnessData.fitscore;
          const currentLevelData = data.find((level, index) => 
            score >= level.min_score && 
            (index === data.length - 1 || score < data[index + 1].min_score)
          );
          
          if (currentLevelData) {
            setCurrentLevel(currentLevelData);
            
            // Set next level (if not at max)
            const currentLevelIndex = data.findIndex(l => l.level === currentLevelData.level);
            const nextLevelData = currentLevelIndex < data.length - 1 
              ? data[currentLevelIndex + 1] 
              : null;
            
            setNextLevel(nextLevelData);
            
            // Calculate progress to next level
            if (nextLevelData) {
              const progressPercent = ((score - currentLevelData.min_score) / 
                (nextLevelData.min_score - currentLevelData.min_score)) * 100;
              setProgress(Math.min(Math.max(progressPercent, 0), 100));
            } else {
              setProgress(100); // At max level
            }
          }
        }
      } catch (err) {
        console.error('Error in Fitscore page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, [fitnessData.fitscore]);

  // Loading state
  if (loading || !currentLevel) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fitscore-500"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="space-y-6 px-4 py-6">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-sm hover:bg-fitscore-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-fitscore-600" />
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-fitscore-600 to-fitscore-500 bg-clip-text text-transparent">
            Fitscore Levels
          </h1>
        </div>

        {/* Current Level Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 ${currentLevel.color} dark:opacity-20 rounded-bl-3xl`} />
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Award className="w-5 h-5 mr-2 text-fitscore-600" />
              Your Level
            </h3>
            <div className="z-10 bg-fitscore-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              Level {currentLevel.level}
            </div>
          </div>
          
          <div className="flex items-baseline mb-2">
            <span className="text-3xl font-bold mr-2">{fitnessData.fitscore}</span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>
          
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{currentLevel.min_score}</span>
            <span>{nextLevel?.min_score || "MAX"}</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          {nextLevel && (
            <p className="text-xs text-muted-foreground mt-3">
              {Math.round(nextLevel.min_score - fitnessData.fitscore)} points to level {nextLevel.level}
            </p>
          )}
        </div>

        {/* Level Requirements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-fitscore-600" />
            Current Level Requirements
          </h3>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily Steps</p>
              <p className="font-semibold text-fitscore-700">{currentLevel.steps_required.toLocaleString()}</p>
            </div>
            <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Distance (km)</p>
              <p className="font-semibold text-fitscore-700">{currentLevel.distance_required}</p>
            </div>
            <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Streak Days</p>
              <p className="font-semibold text-fitscore-700">{currentLevel.streak_days_required}</p>
            </div>
          </div>
          
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Flame className="w-4 h-4 mr-1 text-fitscore-600" />
            Current Level Rewards
          </h4>
          
          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
            {currentLevel.rewards.map((reward, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">{reward}</li>
            ))}
          </ul>
        </div>

        {/* Next Level */}
        {nextLevel && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FastForward className="w-5 h-5 mr-2 text-fitscore-600" />
              Next Level Preview
            </h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Daily Steps</p>
                <p className="font-semibold text-fitscore-700">{nextLevel.steps_required.toLocaleString()}</p>
              </div>
              <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Distance (km)</p>
                <p className="font-semibold text-fitscore-700">{nextLevel.distance_required}</p>
              </div>
              <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Streak Days</p>
                <p className="font-semibold text-fitscore-700">{nextLevel.streak_days_required}</p>
              </div>
            </div>
            
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Flame className="w-4 h-4 mr-1 text-fitscore-600" />
              Next Level Rewards
            </h4>
            
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              {nextLevel.rewards.map((reward, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">{reward}</li>
              ))}
            </ul>
          </div>
        )}

        {/* All Levels */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
          <h3 className="text-lg font-semibold mb-4">All Levels</h3>
          
          <div className="space-y-3">
            {levels.map((level) => (
              <Card 
                key={level.id} 
                className={`border ${level.level === currentLevel.level ? 'border-fitscore-600' : 'border-gray-100 dark:border-gray-700'}`}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${level.color} flex items-center justify-center mr-3`}>
                        <span className="font-bold text-gray-800">{level.level}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Level {level.level}</h4>
                        <p className="text-xs text-gray-500">{level.min_score.toLocaleString()} - {level.max_score === null ? "∞" : level.max_score.toLocaleString()} points</p>
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                      {level.steps_required.toLocaleString()} steps
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Fitscore;
