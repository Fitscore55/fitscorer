
import { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import TransactionList from "@/components/wallet/TransactionList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, Wallet as WalletIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/ads/AdSlot";
import { Wallet as WalletType, Transaction } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Wallet = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletType>({
    balance: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) return;
      
      try {
        // Fetch wallet balance
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
          
        if (walletError) {
          console.error('Error fetching wallet:', walletError);
        }
        
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError);
        }
        
        setWallet({
          balance: walletData?.balance || 0,
          transactions: transactionsData || []
        });
      } catch (err) {
        console.error('Error in wallet data fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [user]);
  
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
          
          {loading ? (
            <div className="text-4xl font-bold my-2 h-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-fitscore-500"></div>
            </div>
          ) : (
            <div className="text-4xl font-bold my-2">{wallet.balance}</div>
          )}
          
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
        
        <AdSlot slotId="wallet-banner" className="mx-auto" />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
              <TabsTrigger value="debits">Debits</TabsTrigger>
            </TabsList>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fitscore-500"></div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </Tabs>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Wallet;
