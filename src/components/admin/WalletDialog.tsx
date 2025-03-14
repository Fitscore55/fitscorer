
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface WalletFormValues {
  amount: number;
  operation: "add" | "deduct";
  reason: string;
}

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserData | null;
  onSubmit: (values: WalletFormValues) => void;
}

const WalletDialog = ({ open, onOpenChange, selectedUser, onSubmit }: WalletDialogProps) => {
  const coinForm = useForm<WalletFormValues>({
    defaultValues: {
      amount: 0,
      operation: "add",
      reason: "",
    },
  });

  if (open && selectedUser) {
    console.log("Wallet dialog opened for user:", selectedUser.username);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage User Wallet</DialogTitle>
          <DialogDescription>
            {selectedUser && `Adjust ${selectedUser.username}'s wallet balance.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...coinForm}>
          <form onSubmit={coinForm.handleSubmit(onSubmit)} className="space-y-4">
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
  );
};

export default WalletDialog;
