
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Award, BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFitnessData } from "@/hooks/useFitnessData";

const AdminDashboard = () => {
  // State for dashboard metrics
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [userGrowth, setUserGrowth] = useState<string>("0%");
  const [activeChallenges, setActiveChallenges] = useState<number>(0);
  const [newChallenges, setNewChallenges] = useState<number>(0);
  const [avgFitScore, setAvgFitScore] = useState<number>(0);
  const [fitScoreGrowth, setFitScoreGrowth] = useState<string>("0%");
  const [totalSteps, setTotalSteps] = useState<string>("0");
  const [stepsGrowth, setStepsGrowth] = useState<string>("0%");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch total users count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        setTotalUsers(userCount || 0);
        
        // Calculate user growth (comparing current month to previous month)
        const currentDate = new Date();
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(currentDate.getMonth() - 1);
        
        const { count: lastMonthUsers, error: lastMonthError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', lastMonthDate.toISOString());
          
        if (lastMonthError) throw lastMonthError;
        
        if (lastMonthUsers && lastMonthUsers > 0) {
          const growth = ((userCount || 0) - lastMonthUsers) / lastMonthUsers * 100;
          setUserGrowth(`+${growth.toFixed(1)}%`);
        }
        
        // Fetch active challenges
        const { data: challenges, error: challengesError } = await supabase
          .from('challenges')
          .select('*')
          .eq('status', 'active');
          
        if (challengesError) throw challengesError;
        setActiveChallenges(challenges?.length || 0);
        
        // Fetch new challenges created in the last week
        const lastWeekDate = new Date();
        lastWeekDate.setDate(currentDate.getDate() - 7);
        
        const { data: newChallengesData, error: newChallengesError } = await supabase
          .from('challenges')
          .select('*')
          .gte('created_at', lastWeekDate.toISOString());
          
        if (newChallengesError) throw newChallengesError;
        setNewChallenges(newChallengesData?.length || 0);
        
        // Fetch average FitScore
        const { data: fitnessData, error: fitnessError } = await supabase
          .from('fitness_sensor_data')
          .select('fitscore');
          
        if (fitnessError) throw fitnessError;
        
        if (fitnessData && fitnessData.length > 0) {
          const totalFitScore = fitnessData.reduce((sum, item) => sum + item.fitscore, 0);
          const avgScore = Math.round(totalFitScore / fitnessData.length);
          setAvgFitScore(avgScore);
          
          // Calculate FitScore growth (simple example with static growth)
          setFitScoreGrowth("+5.2%");
        }
        
        // Fetch total steps
        const { data: stepsData, error: stepsError } = await supabase
          .from('fitness_sensor_data')
          .select('steps');
          
        if (stepsError) throw stepsError;
        
        if (stepsData && stepsData.length > 0) {
          const totalStepsCount = stepsData.reduce((sum, item) => sum + item.steps, 0);
          setTotalSteps(formatLargeNumber(totalStepsCount));
          
          // Calculate steps growth (simple example with static growth)
          setStepsGrowth("+10.1%");
        }
        
        // Fetch recent activity (last 24 hours)
        const last24HoursDate = new Date();
        last24HoursDate.setHours(currentDate.getHours() - 24);
        
        // Using fitness_sensor_data as a proxy for user activity
        const { data: activityData, error: activityError } = await supabase
          .from('fitness_sensor_data')
          .select('user_id, created_at, steps')
          .gte('created_at', last24HoursDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (activityError) throw activityError;
        
        // Fetch usernames for the activities
        if (activityData && activityData.length > 0) {
          const userIds = activityData.map(item => item.user_id);
          const { data: userData, error: userDataError } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds);
            
          if (userDataError) throw userDataError;
          
          const activitiesWithUsernames = activityData.map(activity => {
            const user = userData?.find(u => u.id === activity.user_id);
            const hoursAgo = Math.floor((new Date().getTime() - new Date(activity.created_at).getTime()) / (1000 * 60 * 60));
            
            return {
              username: user?.username || `User_${activity.user_id.substring(0, 8)}`,
              action: activity.steps > 5000 ? "Completed steps goal" : "Recorded activity",
              timeAgo: `${hoursAgo}h ago`
            };
          });
          
          setRecentActivity(activitiesWithUsernames);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6 pt-2">
      <h2 className="text-xl font-semibold mb-4">System Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : totalUsers}</div>
            <p className="text-xs text-muted-foreground">{userGrowth} from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : activeChallenges}</div>
            <p className="text-xs text-muted-foreground">+{newChallenges} new this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Fitscore</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : avgFitScore}</div>
            <p className="text-xs text-muted-foreground">{fitScoreGrowth} from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Steps</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : totalSteps}</div>
            <p className="text-xs text-muted-foreground">{stepsGrowth} from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent App Activity</CardTitle>
            <CardDescription>User actions in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-fitscore-500"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              <ul className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <li key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{activity.username}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.timeAgo}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">API Response Time</p>
                  <p className="text-sm font-medium text-fitscore-600">180ms</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-fitscore-500 w-[20%]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Database Load</p>
                  <p className="text-sm font-medium text-amber-600">42%</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[42%]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Memory Usage</p>
                  <p className="text-sm font-medium text-emerald-600">28%</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[28%]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Storage</p>
                  <p className="text-sm font-medium text-red-600">78%</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[78%]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
