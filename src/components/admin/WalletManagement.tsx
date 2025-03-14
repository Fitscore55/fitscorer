
import { useState, useEffect } from "react";
import { RefreshCcw, CreditCard, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserData } from "@/types/admin";
import WalletDialog from "./WalletDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const WalletManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openWalletDialog, setOpenWalletDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Transform data to match our component needs
      const formattedUsers = profiles.map(profile => ({
        id: profile.id,
        username: profile.username || 'unnamed',
        email: profile.email || 'no email',
        phone: profile.phone || null,
        fitscore: Math.floor(Math.random() * 1000), // Mock fitscore for now
        active: true, // Default to active
        joinDate: profile.created_at || new Date().toISOString(),
        walletBalance: Math.floor(Math.random() * 5000), // Mock wallet balance for now
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Failed to fetch users",
        description: "There was an error loading the user list.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleWalletAction = (user: UserData, action: "add" | "deduct" = "add") => {
    console.log("Opening wallet dialog for user:", user);
    setSelectedUser(user);
    // Pre-set the operation based on which button was clicked
    const form = document.querySelector('form');
    if (form) {
      const switchInput = form.querySelector('input[type="checkbox"]');
      if (switchInput) {
        // @ts-ignore
        switchInput.checked = action === "add";
      }
    }
    setOpenWalletDialog(true);
  };

  const handleWalletSubmit = (values: { amount: number; operation: "add" | "deduct"; reason: string }) => {
    if (!selectedUser) return;

    // In a real app, this would call an API to update the user's wallet
    console.log("Wallet operation:", {
      userId: selectedUser.id,
      username: selectedUser.username,
      ...values
    });

    // Update the local state to show the change immediately
    setUsers(users.map(user => {
      if (user.id === selectedUser.id) {
        const currentBalance = user.walletBalance || 0;
        const newBalance = values.operation === "add" 
          ? currentBalance + values.amount 
          : Math.max(0, currentBalance - values.amount);
        
        return { ...user, walletBalance: newBalance };
      }
      return user;
    }));

    // Show success message
    toast({
      title: "Wallet updated",
      description: `${values.operation === "add" ? "Added" : "Deducted"} ${values.amount} coins ${values.operation === "add" ? "to" : "from"} ${selectedUser.username}'s wallet.`,
    });

    setOpenWalletDialog(false);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Wallet Management</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>User Wallets</CardTitle>
          <CardDescription>Manage user wallet balances and transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2 pt-2 mb-4">
            <div className="relative w-full">
              <Input 
                type="search" 
                placeholder="Search by username or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-fitscore-500"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No users match your search" : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-fitscore-500" />
                          <span>{user.walletBalance || 0} coins</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 text-green-600"
                            onClick={() => handleWalletAction(user, "add")}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 text-red-600"
                            onClick={() => handleWalletAction(user, "deduct")}
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Deduct
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <WalletDialog 
        open={openWalletDialog}
        onOpenChange={setOpenWalletDialog}
        selectedUser={selectedUser}
        onSubmit={handleWalletSubmit}
      />
    </div>
  );
};

export default WalletManagement;
