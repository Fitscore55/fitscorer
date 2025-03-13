
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

const mockData = {
  daily: [
    { name: "Mon", steps: 5600 },
    { name: "Tue", steps: 7800 },
    { name: "Wed", steps: 4500 },
    { name: "Thu", steps: 9200 },
    { name: "Fri", steps: 8100 },
    { name: "Sat", steps: 6300 },
    { name: "Sun", steps: 7400 },
  ],
  weekly: [
    { name: "Week 1", steps: 32500 },
    { name: "Week 2", steps: 41200 },
    { name: "Week 3", steps: 38700 },
    { name: "Week 4", steps: 45600 },
  ],
  monthly: [
    { name: "Jan", steps: 142500 },
    { name: "Feb", steps: 165200 },
    { name: "Mar", steps: 148700 },
    { name: "Apr", steps: 172400 },
    { name: "May", steps: 156800 },
    { name: "Jun", steps: 182300 },
  ],
};

const ActivityChart = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("daily");
  const [chartData, setChartData] = useState(mockData.daily);

  useEffect(() => {
    setChartData(mockData[activeTab as keyof typeof mockData]);
  }, [activeTab]);

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

      <div className="w-full h-48">
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
