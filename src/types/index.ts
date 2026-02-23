// Types for the LeetCode Challenge Tracker

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  leetcodeUsername: string;
}

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  minSubmissionsPerDay: number;
  difficultyFilter?: string[] | null;
  uniqueProblemConstraint?: boolean;
  penaltyAmount: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "PENDING" | "COMPLETED" | "CANCELLED" | string;
  visibility?: "PUBLIC" | "PRIVATE" | string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: {
    id: string;
    username: string;
  };
  _count?: {
    members: number;
  };
  members?: ChallengeMember[];
}

export interface ChallengeMember {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'completed' | 'failed' | 'pending';
  streak: number;
  totalPenalty: number;
  dailyProgress: DailyProgress[];
}

export interface DailyProgress {
  date: string;
  solved: number;
  target: number;
  status: 'completed' | 'failed' | 'pending';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  totalSolved: number;
  currentStreak: number;
  missedDays: number;
  penaltyAmount: number;
}

export interface Stats {
  todayStatus: 'completed' | 'failed' | 'pending';
  todaySolved: number;
  todayTarget: number;
  currentStreak: number;
  longestStreak: number;
  totalPenalties: number;
  activeChallenges: number;
  totalSolved: number;
}

export interface ActivityData {
  date: string;
  count: number;
}

export interface ChartData {
  date: string;
  solved: number;
  target: number;
}

export type RawData = {
  date?: string;
  displayDate?: string;
  solved?: number;
  passed?: number;
  submissions?: number;
  target?: number;
  dailyTarget?: number;
};
