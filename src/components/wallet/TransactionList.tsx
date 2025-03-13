
import { 
  ArrowDownRight, 
  ArrowUpRight,
  Search
} from "lucide-react";
import { Transaction } from "@/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search transactions" 
          className="pl-9" 
        />
      </div>
      
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex justify-between items-center"
          >
            <div className="flex items-center">
              <div 
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center mr-3",
                  transaction.type === "credit" 
                    ? "bg-success-100 text-success-600" 
                    : "bg-challenge-100 text-challenge-600"
                )}
              >
                {transaction.type === "credit" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <p 
              className={cn(
                "font-medium",
                transaction.type === "credit" 
                  ? "text-success-600" 
                  : "text-challenge-600"
              )}
            >
              {transaction.type === "credit" ? "+" : "-"}
              {transaction.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;
