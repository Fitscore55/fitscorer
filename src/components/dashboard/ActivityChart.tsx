
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
import { useFitnessData } from "@/hooks/useFitnessData";
import { useAuth } from "@/contexts/AuthContext";

// Empty data placeholder
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
  const { fetchHistoricalData } = useFitnessData(user?.id);

  // Fetch data when the active tab changes or when the user logs in
  useEffect(() => {
    if (!user) {
      setChartData(emptyData[activeTab as keyof typeof emptyData]);
      setIsLoading(false);
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchHistoricalData(activeTab as 'daily' | 'weekly' | 'monthly');
      
      if (data && data.length > 0) {
        setChartData(data);
      } else {
        setChartData(emptyData[activeTab as keyof typeof emptyData]);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [activeTab, user, fetchHistoricalData]);

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
            No activity data available
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
