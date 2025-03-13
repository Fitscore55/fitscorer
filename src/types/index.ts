
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface FitnessData {
  steps: number;
  distance: number;
  fitscore: number;
  calories: number;
  date: string;
}

export interface FitnessDataHistory {
  daily: FitnessData[];
  weekly: {
    steps: number;
    distance: number;
    fitscore: number;
    calories: number;
  };
  monthly: {
    steps: number;
    distance: number;
    fitscore: number;
    calories: number;
  };
}

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  goal_type: 'steps' | 'distance';
  goal_value: number;
  start_date: string;
  end_date: string;
  min_participants: number;
  max_participants: number;
  stake_amount: number;
  participants: ChallengeParticipant[];
  status: 'upcoming' | 'active' | 'completed';
  created_by: string;
  created_at: string;
}

export interface ChallengeParticipant {
  user_id: string;
  username: string;
  current_progress: number;
  joined_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

export interface Wallet {
  balance: number;
  transactions: Transaction[];
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  fitscore: number;
  rank: number;
}
