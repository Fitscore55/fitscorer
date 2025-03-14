
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

// Empty data placeholder for loading state
const emptyData = {
  daily: Array(7).fill(0).map((_, i) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return { name: days[i], steps: 0 };
  }),
  weekly: Array(4).fill(0).map((_, i) => ({ name: `Week ${i+1}`, steps: 0 })),
  monthly: Array(6).fill(0).map((_, i) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return { name: months[i], steps: 0 };
  })
};

const ActivityChart = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("daily");
  const [chartData, setChartData] = useState(emptyData.daily);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isNativePlatform = Capacitor.isNativePlatform();

  // Fetch data when the active tab changes or when the user logs in
  useEffect(() => {
    if (!user) {
      setChartData(emptyData[activeTab as keyof typeof emptyData]);
      setIsLoading(false);
      return;
    }
    
    const fetchActivityData = async () => {
      setIsLoading(true);
      
      try {
        let timeFilter = new Date();
        let interval: "day" | "week" | "month" = "day";
        
        // Set the time filter based on the active tab
        switch(activeTab) {
          case "daily":
            // Last 7 days
            timeFilter.setDate(timeFilter.getDate() - 7);
            interval = "day";
            break;
          case "weekly":
            // Last 4 weeks
            timeFilter.setDate(timeFilter.getDate() - 28);
            interval = "week";
            break;
          case "monthly":
            // Last 6 months
            timeFilter.setMonth(timeFilter.getMonth() - 6);
            interval = "month";
            break;
        }
        
        // Fetch data from Supabase
        const { data, error } = await supabase
          .from('fitness_sensor_data')
          .select('recorded_at, steps')
          .eq('user_id', user.id)
          .gte('recorded_at', timeFilter.toISOString())
          .order('recorded_at', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log(`Found ${data.length} activity records for interval ${interval}`);
          // Process data based on active tab
          const processedData = processActivityData(data, activeTab, interval);
          setChartData(processedData);
        } else {
          console.log('No activity data found for the selected period');
          // No data found, use empty data
          setChartData(emptyData[activeTab as keyof typeof emptyData]);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
        toast.error("Failed to load activity data");
        setChartData(emptyData[activeTab as keyof typeof emptyData]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivityData();
    
    // Set up real-time subscription for fitness data updates
    if (user) {
      const channel = supabase
        .channel('fitness-data-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'fitness_sensor_data',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('New fitness data detected, refreshing chart');
          fetchActivityData();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeTab, user]);

  // Process the data based on the active tab and interval
  const processActivityData = (
    data: { recorded_at: string; steps: number }[],
    activeTab: string,
    interval: "day" | "week" | "month"
  ) => {
    const aggregatedData: Record<string, { steps: number; count: number }> = {};
    
    // Group and aggregate data based on the interval
    data.forEach(item => {
      const date = new Date(item.recorded_at);
      let key: string;
      
      switch(interval) {
        case "day":
          // Group by day of week
          key = date.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case "week":
          // Group by week number
          const weekNumber = Math.floor(
            (date.getTime() - new Date().setDate(new Date().getDate() - 28)) / 
            (7 * 24 * 60 * 60 * 1000)
          );
          key = `Week ${Math.abs(weekNumber) + 1}`;
          break;
        case "month":
          // Group by month
          key = date.toLocaleDateString('en-US', { month: 'short' });
          break;
      }
      
      if (!aggregatedData[key]) {
        aggregatedData[key] = { steps: 0, count: 0 };
      }
      
      aggregatedData[key].steps += item.steps;
      aggregatedData[key].count += 1;
    });
    
    // Calculate averages and format data for the chart
    const chartData = Object.entries(aggregatedData).map(([name, data]) => ({
      name,
      steps: Math.round(data.steps / data.count)
    }));
    
    // For daily data, ensure we have all days of the week in the correct order
    if (interval === "day") {
      const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const sortedData = [...chartData].sort((a, b) => 
        daysOrder.indexOf(a.name) - daysOrder.indexOf(b.name)
      );
      
      // Ensure we have data for all days
      const filledData = daysOrder.map(day => {
        const existing = sortedData.find(item => item.name === day);
        return existing || { name: day, steps: 0 };
      });
      
      return filledData;
    }
    
    return chartData;
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Activity</h3>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid grid-cols-3 h-8">
            <TabsTrigger value="daily" className="text-xs px-2">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs px-2">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs px-2">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="w-full h-48 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-fitscore-500"></div>
          </div>
        ) : chartData.every(item => item.steps === 0) ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            {isNativePlatform ? 
              "No activity data yet. Start tracking to see your progress!" : 
              "Activity tracking only available on mobile devices"}
          </div>
        ) : null}
        
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 0,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              width={isMobile ? 25 : 30}
            />
            <Tooltip />
            <Bar 
              dataKey="steps" 
              fill="#40A9FF" 
              radius={[4, 4, 0, 0]} 
              barSize={isMobile ? 15 : 30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ActivityChart;
