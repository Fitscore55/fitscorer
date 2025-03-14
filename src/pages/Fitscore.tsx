
import { useEffect, useState } from "react";
import { ArrowLeft, Award, FastForward, Flame, Target } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { mockFitnessData } from "@/utils/mockData";

interface LevelInfo {
  level: number;
  minScore: number;
  maxScore: number;
  requirements: {
    steps: number;
    distance: number;
    streakDays: number;
  };
  rewards: string[];
  color: string;
}

const Fitscore = () => {
  const [fitnessData, setFitnessData] = useState(mockFitnessData);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [nextLevel, setNextLevel] = useState(0);
  const [progress, setProgress] = useState(0);

  // Define level information with increasing difficulty
  const levels: LevelInfo[] = [
    {
      level: 1,
      minScore: 0,
      maxScore: 500,
      requirements: { steps: 3000, distance: 1, streakDays: 1 },
      rewards: ["Basic Badge", "50 Reward Points"],
      color: "bg-gray-200"
    },
    {
      level: 2,
      minScore: 500,
      maxScore: 1000,
      requirements: { steps: 5000, distance: 2, streakDays: 2 },
      rewards: ["Bronze Badge", "100 Reward Points"],
      color: "bg-amber-200"
    },
    {
      level: 3,
      minScore: 1000,
      maxScore: 2000,
      requirements: { steps: 7000, distance: 3, streakDays: 3 },
      rewards: ["Silver Badge", "150 Reward Points"],
      color: "bg-gray-300"
    },
    {
      level: 4,
      minScore: 2000,
      maxScore: 3500,
      requirements: { steps: 8000, distance: 4, streakDays: 4 },
      rewards: ["Gold Badge", "200 Reward Points"],
      color: "bg-yellow-200"
    },
    {
      level: 5,
      minScore: 3500,
      maxScore: 5500,
      requirements: { steps: 9000, distance: 5, streakDays: 5 },
      rewards: ["Platinum Badge", "250 Reward Points", "Special Profile Frame"],
      color: "bg-blue-200"
    },
    {
      level: 6,
      minScore: 5500,
      maxScore: 8000,
      requirements: { steps: 10000, distance: 6, streakDays: 7 },
      rewards: ["Diamond Badge", "300 Reward Points", "Exclusive Avatar"],
      color: "bg-indigo-200"
    },
    {
      level: 7,
      minScore: 8000,
      maxScore: 11000,
      requirements: { steps: 12000, distance: 8, streakDays: 10 },
      rewards: ["Ruby Badge", "400 Reward Points", "Early Access to Features"],
      color: "bg-red-200"
    },
    {
      level: 8,
      minScore: 11000,
      maxScore: 15000,
      requirements: { steps: 15000, distance: 10, streakDays: 14 },
      rewards: ["Sapphire Badge", "500 Reward Points", "Custom Theme"],
      color: "bg-blue-300"
    },
    {
      level: 9,
      minScore: 15000,
      maxScore: 20000,
      requirements: { steps: 18000, distance: 12, streakDays: 20 },
      rewards: ["Emerald Badge", "750 Reward Points", "Premium Features"],
      color: "bg-green-300"
    },
    {
      level: 10,
      minScore: 20000,
      maxScore: Infinity,
      requirements: { steps: 20000, distance: 15, streakDays: 30 },
      rewards: ["Master Badge", "1000 Reward Points", "Lifetime Premium", "Physical Reward"],
      color: "bg-purple-300"
    }
  ];

  useEffect(() => {
    // Determine current level based on fitness score
    const score = fitnessData.fitscore;
    const level = levels.find((l, index) => 
      score >= l.minScore && (index === levels.length - 1 || score < levels[index + 1].minScore)
    );
    
    if (level) {
      setCurrentLevel(level.level);
      
      // Set next level (if not at max)
      const nextLevelIndex = Math.min(level.level, levels.length - 1);
      setNextLevel(nextLevelIndex + 1);
      
      // Calculate progress to next level
      const nextLevelObj = levels[nextLevelIndex];
      const progressPercent = nextLevelObj && nextLevelObj.maxScore !== Infinity 
        ? ((score - level.minScore) / (nextLevelObj.maxScore - level.minScore)) * 100
        : 100;
      
      setProgress(progressPercent);
    }
  }, [fitnessData]);

  const currentLevelInfo = levels.find(l => l.level === currentLevel);
  const nextLevelInfo = levels.find(l => l.level === nextLevel);

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
          <div className={`absolute top-0 right-0 w-24 h-24 ${currentLevelInfo?.color} dark:opacity-20 rounded-bl-3xl`} />
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Award className="w-5 h-5 mr-2 text-fitscore-600" />
              Your Level
            </h3>
            <div className="z-10 bg-fitscore-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              Level {currentLevel}
            </div>
          </div>
          
          <div className="flex items-baseline mb-2">
            <span className="text-3xl font-bold mr-2">{fitnessData.fitscore}</span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>
          
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{currentLevelInfo?.minScore}</span>
            <span>{nextLevelInfo?.minScore || "MAX"}</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          {nextLevelInfo && (
            <p className="text-xs text-muted-foreground mt-3">
              {Math.round(nextLevelInfo.minScore - fitnessData.fitscore)} points to level {nextLevel}
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
              <p className="font-semibold text-fitscore-700">{currentLevelInfo?.requirements.steps.toLocaleString()}</p>
            </div>
            <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Distance (km)</p>
              <p className="font-semibold text-fitscore-700">{currentLevelInfo?.requirements.distance}</p>
            </div>
            <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Streak Days</p>
              <p className="font-semibold text-fitscore-700">{currentLevelInfo?.requirements.streakDays}</p>
            </div>
          </div>
          
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Flame className="w-4 h-4 mr-1 text-fitscore-600" />
            Current Level Rewards
          </h4>
          
          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
            {currentLevelInfo?.rewards.map((reward, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">{reward}</li>
            ))}
          </ul>
        </div>

        {/* Next Level */}
        {nextLevelInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FastForward className="w-5 h-5 mr-2 text-fitscore-600" />
              Next Level Preview
            </h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Daily Steps</p>
                <p className="font-semibold text-fitscore-700">{nextLevelInfo.requirements.steps.toLocaleString()}</p>
              </div>
              <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Distance (km)</p>
                <p className="font-semibold text-fitscore-700">{nextLevelInfo.requirements.distance}</p>
              </div>
              <div className="bg-fitscore-50 dark:bg-gray-700 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Streak Days</p>
                <p className="font-semibold text-fitscore-700">{nextLevelInfo.requirements.streakDays}</p>
              </div>
            </div>
            
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Flame className="w-4 h-4 mr-1 text-fitscore-600" />
              Next Level Rewards
            </h4>
            
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              {nextLevelInfo.rewards.map((reward, index) => (
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
                key={level.level} 
                className={`border ${level.level === currentLevel ? 'border-fitscore-600' : 'border-gray-100 dark:border-gray-700'}`}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${level.color} flex items-center justify-center mr-3`}>
                        <span className="font-bold text-gray-800">{level.level}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Level {level.level}</h4>
                        <p className="text-xs text-gray-500">{level.minScore.toLocaleString()} - {level.maxScore === Infinity ? "∞" : level.maxScore.toLocaleString()} points</p>
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                      {level.requirements.steps.toLocaleString()} steps
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
