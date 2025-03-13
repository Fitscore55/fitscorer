
import { 
  FitnessData, 
  FitnessDataHistory, 
  Challenge,
  Transaction,
  Wallet,
  LeaderboardEntry
} from "@/types";

// Mock fitness data for a user
export const mockFitnessData: FitnessData = {
  steps: 8742,
  distance: 6.3,
  fitscore: 784,
  calories: 312,
  date: new Date().toISOString(),
};

// Mock fitness history for visualizations
export const mockFitnessHistory: FitnessDataHistory = {
  daily: [
    { steps: 9234, distance: 7.1, fitscore: 802, calories: 345, date: "2023-05-01" },
    { steps: 7845, distance: 5.9, fitscore: 756, calories: 298, date: "2023-05-02" },
    { steps: 10253, distance: 7.8, fitscore: 824, calories: 378, date: "2023-05-03" },
    { steps: 6543, distance: 4.8, fitscore: 712, calories: 254, date: "2023-05-04" },
    { steps: 8742, distance: 6.3, fitscore: 784, calories: 312, date: "2023-05-05" },
    { steps: 9876, distance: 7.2, fitscore: 815, calories: 362, date: "2023-05-06" },
    { steps: 11245, distance: 8.4, fitscore: 845, calories: 415, date: "2023-05-07" },
  ],
  weekly: {
    steps: 63738,
    distance: 47.5,
    fitscore: 5538,
    calories: 2364,
  },
  monthly: {
    steps: 274652,
    distance: 203.4,
    fitscore: 23845,
    calories: 10236,
  },
};

// Mock challenges
export const mockChallenges: Challenge[] = [
  {
    id: "c1",
    name: "10K Steps Challenge",
    description: "Complete 10,000 steps daily for 7 days",
    goal_type: "steps",
    goal_value: 70000,
    start_date: "2023-05-10",
    end_date: "2023-05-17",
    min_participants: 2,
    max_participants: 10,
    stake_amount: 20,
    participants: [
      {
        user_id: "current-user",
        username: "You",
        current_progress: 35000,
        joined_at: "2023-05-09",
      },
      {
        user_id: "u2",
        username: "JaneWalker",
        current_progress: 42000,
        joined_at: "2023-05-09",
      },
      {
        user_id: "u3",
        username: "MikeRunner",
        current_progress: 38000,
        joined_at: "2023-05-08",
      },
    ],
    status: "active",
    created_by: "u2",
    created_at: "2023-05-05",
  },
  {
    id: "c2",
    name: "Marathon Prep",
    description: "Run 50km in two weeks",
    goal_type: "distance",
    goal_value: 50,
    start_date: "2023-05-20",
    end_date: "2023-06-03",
    min_participants: 3,
    max_participants: 15,
    stake_amount: 30,
    participants: [
      {
        user_id: "u2",
        username: "JaneWalker",
        current_progress: 0,
        joined_at: "2023-05-15",
      },
      {
        user_id: "u4",
        username: "SarahFit",
        current_progress: 0,
        joined_at: "2023-05-16",
      },
    ],
    status: "upcoming",
    created_by: "u4",
    created_at: "2023-05-12",
  },
  {
    id: "c3",
    name: "Weekend Warrior",
    description: "Complete 25,000 steps over the weekend",
    goal_type: "steps",
    goal_value: 25000,
    start_date: "2023-04-29",
    end_date: "2023-04-30",
    min_participants: 2,
    max_participants: 20,
    stake_amount: 10,
    participants: [
      {
        user_id: "current-user",
        username: "You",
        current_progress: 27500,
        joined_at: "2023-04-28",
      },
      {
        user_id: "u2",
        username: "JaneWalker",
        current_progress: 26800,
        joined_at: "2023-04-28",
      },
      {
        user_id: "u3",
        username: "MikeRunner",
        current_progress: 28200,
        joined_at: "2023-04-28",
      },
      {
        user_id: "u4",
        username: "SarahFit",
        current_progress: 29400,
        joined_at: "2023-04-27",
      },
    ],
    status: "completed",
    created_by: "u3",
    created_at: "2023-04-25",
  },
];

// Mock transactions for wallet
export const mockTransactions: Transaction[] = [
  {
    id: "t1",
    user_id: "current-user",
    amount: 5,
    type: "credit",
    description: "5,000 Steps Completed",
    created_at: "2023-05-07T15:45:30Z",
  },
  {
    id: "t2",
    user_id: "current-user",
    amount: 10,
    type: "credit",
    description: "10,000 Steps Completed",
    created_at: "2023-05-06T18:22:15Z",
  },
  {
    id: "t3",
    user_id: "current-user",
    amount: 20,
    type: "debit",
    description: "Joined 10K Steps Challenge",
    created_at: "2023-05-05T09:15:00Z",
  },
  {
    id: "t4",
    user_id: "current-user",
    amount: 3,
    type: "credit",
    description: "3,000 Steps Completed",
    created_at: "2023-05-04T14:33:45Z",
  },
  {
    id: "t5",
    user_id: "current-user",
    amount: 8,
    type: "credit",
    description: "8,000 Steps Completed",
    created_at: "2023-05-03T17:10:22Z",
  },
  {
    id: "t6",
    user_id: "current-user",
    amount: 30,
    type: "credit",
    description: "Weekend Warrior Challenge Win",
    created_at: "2023-05-01T10:08:12Z",
  },
];

// Mock wallet
export const mockWallet: Wallet = {
  balance: 36,
  transactions: mockTransactions,
};

// Mock leaderboard data
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    user_id: "u4",
    username: "SarahFit",
    fitscore: 42560,
    rank: 1,
  },
  {
    user_id: "u3",
    username: "MikeRunner",
    fitscore: 38745,
    rank: 2,
  },
  {
    user_id: "u2",
    username: "JaneWalker",
    fitscore: 36120,
    rank: 3,
  },
  {
    user_id: "current-user",
    username: "You",
    fitscore: 34980,
    rank: 4,
  },
  {
    user_id: "u5",
    username: "FitnessFreak",
    fitscore: 33450,
    rank: 5,
  },
  {
    user_id: "u6",
    username: "StepMaster",
    fitscore: 31890,
    rank: 6,
  },
  {
    user_id: "u7",
    username: "WalkingQueen",
    fitscore: 29740,
    rank: 7,
  },
  {
    user_id: "u8",
    username: "TrailRunner",
    fitscore: 28560,
    rank: 8,
  },
  {
    user_id: "u9",
    username: "JoggerPro",
    fitscore: 26980,
    rank: 9,
  },
  {
    user_id: "u10",
    username: "MoveDaily",
    fitscore: 24320,
    rank: 10,
  },
];
