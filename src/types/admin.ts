
export type UserData = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  fitscore: number;
  active: boolean;
  joinDate: string;
  walletBalance?: number; // Optional wallet balance field
};
