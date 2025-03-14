
import { useState, useEffect } from "react";
import { PlusCircle, Search, MoreHorizontal, RefreshCcw, Ban, Trash2, Key, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserData = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  fitscore: number;
  active: boolean;
  joinDate: string;
};

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openWalletDialog, setOpenWalletDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Create form for coin management
  const coinForm = useForm({
    defaultValues: {
      amount: 0,
      operation: "add" as "add" | "deduct",
      reason: "",
    },
  });

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Transform data to match our component needs
      // In a real app, you would fetch fitscore from another table
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

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    // Reset form
    coinForm.reset({
      amount: 0,
      operation: "add",
      reason: "",
    });
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
          <div className="flex w-full max-w-sm items-center space-x-2 pt-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search by username or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                  <TableHead>Phone</TableHead>
                  <TableHead>Fitscore</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No users match your search" : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "—"}</TableCell>
                      <TableCell>{user.fitscore}</TableCell>
                      <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={user.active} 
                            onCheckedChange={() => toggleUserStatus(user.id)} 
                          />
                          <span className={user.active ? "text-green-600" : "text-red-600"}>
                            {user.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleWalletAction(user)}
                              className="cursor-pointer"
                            >
                              <Wallet className="h-4 w-4 mr-2" />
                              Manage Wallet
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleResetPassword(user)}
                              className="cursor-pointer"
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleBanUser(user)}
                              className="cursor-pointer text-yellow-500"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="cursor-pointer text-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Wallet Management Dialog */}
      <Dialog open={openWalletDialog} onOpenChange={setOpenWalletDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage User Wallet</DialogTitle>
            <DialogDescription>
              {selectedUser && `Adjust ${selectedUser.username}'s wallet balance.`}
            </DialogDescription>
          </DialogHeader>
          <Form {...coinForm}>
            <form onSubmit={coinForm.handleSubmit(handleWalletSubmit)} className="space-y-4">
              <FormField
                control={coinForm.control}
                name="operation"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Operation</FormLabel>
                    <div className="flex gap-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.value === "add"}
                            onCheckedChange={(checked) => field.onChange(checked ? "add" : "deduct")}
                          />
                          <span>{field.value === "add" ? "Add Coins" : "Deduct Coins"}</span>
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={coinForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter amount"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={coinForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Reason for adjustment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={coinForm.getValues().amount <= 0}>
                  {coinForm.getValues().operation === "add" ? "Add Coins" : "Deduct Coins"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
