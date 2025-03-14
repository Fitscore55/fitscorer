
import { 
  FitnessData, 
  FitnessDataHistory, 
  Challenge,
  Transaction,
  Wallet,
  LeaderboardEntry
} from "@/types";

// Initial fitness data for a user - to be populated with real data
export const mockFitnessData: FitnessData = {
  steps: 0,
  distance: 0,
  fitscore: 0,
  calories: 0,
  date: new Date().toISOString(),
};

// Empty fitness history - to be populated with real API data
export const mockFitnessHistory: FitnessDataHistory = {
  daily: [],
  weekly: {
    steps: 0,
    distance: 0,
    fitscore: 0,
    calories: 0,
  },
  monthly: {
    steps: 0,
    distance: 0,
    fitscore: 0,
    calories: 0,
  },
};

// Empty challenges array - to be populated with real API data
export const mockChallenges: Challenge[] = [];

// Empty transactions array - to be populated with real API data
export const mockTransactions: Transaction[] = [];

// Initial wallet with zero balance
export const mockWallet: Wallet = {
  balance: 0,
  transactions: [],
};

// Empty leaderboard - to be populated with real API data
export const mockLeaderboard: LeaderboardEntry[] = [];
