
import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import TransactionList from "@/components/wallet/TransactionList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, Wallet as WalletIcon } from "lucide-react";
import { mockWallet } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";

const Wallet = () => {
  const { toast } = useToast();
  const [wallet] = useState(mockWallet);
  
  const handleWithdraw = () => {
    toast({
      title: "Coming Soon",
      description: "The withdrawal feature is not yet available.",
    });
  };

  return (
    <MobileLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Wallet</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-fitscore-100 flex items-center justify-center">
              <WalletIcon className="h-8 w-8 text-fitscore-600" />
            </div>
          </div>
          <h3 className="font-semibold text-lg">Coin Balance</h3>
          <div className="text-4xl font-bold my-2">{wallet.balance}</div>
          <p className="text-sm text-muted-foreground mb-4">
            Each 1000 steps = 1 coin
          </p>
          <Button 
            onClick={handleWithdraw}
            className="w-full flex items-center justify-center"
          >
            <ArrowDown className="mr-2 h-4 w-4" />
            Withdraw (Coming Soon)
          </Button>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
              <TabsTrigger value="debits">Debits</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <TransactionList transactions={wallet.transactions} />
            </TabsContent>
            
            <TabsContent value="credits">
              <TransactionList 
                transactions={wallet.transactions.filter(t => t.type === "credit")} 
              />
            </TabsContent>
            
            <TabsContent value="debits">
              <TransactionList 
                transactions={wallet.transactions.filter(t => t.type === "debit")} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Wallet;
