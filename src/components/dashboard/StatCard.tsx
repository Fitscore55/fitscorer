
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  highlight?: boolean;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  highlight = false,
  trend,
}: StatCardProps) => {
  return (
    <Card className={cn(
      highlight ? "stats-card-highlight" : "stats-card"
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="text-fitscore-600">{icon}</div>
      </div>
      
      {trend && (
        <div className="mt-2 flex items-center">
          <span
            className={cn("text-xs font-medium", {
              "text-success-600": trend.direction === "up",
              "text-challenge-600": trend.direction === "down",
            })}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">vs last week</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
