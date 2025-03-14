
import { useState, useEffect } from "react";
import { PlusCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserData } from "@/types/admin";
import UserTable from "./UserTable";
import WalletDialog from "./WalletDialog";

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, active: !user.active } : user
    ));
    
    // In a real app, you would update the user status in the database
    toast({
      title: "User status updated",
      description: "The change has been saved successfully.",
    });
  };

  const handleWalletAction = (user: UserData) => {
    setSelectedUser(user);
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

    // Show success message
    toast({
      title: "Wallet updated",
      description: `${values.operation === "add" ? "Added" : "Deducted"} ${values.amount} coins ${values.operation === "add" ? "to" : "from"} ${selectedUser.username}'s wallet.`,
    });

    setOpenWalletDialog(false);
  };

  const handleBanUser = (user: UserData) => {
    // In a real app, this would call an API to ban the user
    toast({
      title: "User banned",
      description: `${user.username} has been banned from the platform.`,
    });
  };

  const handleDeleteUser = (user: UserData) => {
    // In a real app, this would call an API to delete the user
    toast({
      title: "User deleted",
      description: `${user.username} has been removed from the platform.`,
    });
  };

  const handleResetPassword = (user: UserData) => {
    // In a real app, this would call an API to reset the user's password
    toast({
      title: "Password reset",
      description: `A password reset link has been sent to ${user.email}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
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
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage registered users and their permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable 
            users={users}
            isLoading={isLoading}
            toggleUserStatus={toggleUserStatus}
            handleWalletAction={handleWalletAction}
            handleResetPassword={handleResetPassword}
            handleBanUser={handleBanUser}
            handleDeleteUser={handleDeleteUser}
          />
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

export default UserManagement;
