// Types for the LeetCode Challenge Tracker

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  leetcodeUsername: string;
  createdAt?: string;
  memberships?: ChallengeMember[];
  ownedChallenges?: Challenge[];
}

export interface Challenge {
  id: string;
  name: string;
  dailyTarget: number;
  difficulty: "easy" | "medium" | "hard" | "any";
  penaltyAmount?: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  members: ChallengeMember[];
  isActive: boolean;
  difficultyFilter?: string[];
  status?: "ACTIVE" | "PENDING" | "COMPLETED" | "CANCELLED";
  minSubmissionsPerDay?: number;
  description?: string;
  ownerId?: string;
}

export interface ChallengeMember {
  userId: string;
  userName: string;
  avatar?: string;
  status: "completed" | "failed" | "pending";
  joinedAt: string;
  streak?: number;
  totalPenalty?: number;
  dailyProgress?: DailyProgress[];
}

export interface DailyProgress {
  date: string;
  solved: number;
  target: number;
  status: "completed" | "failed" | "pending";
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
  todayStatus: "completed" | "failed" | "pending";
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

// ============================================
// Streak & Consistency Tracking Types
// ============================================

export interface ActivityLog {
  dates: string[];
  currentStreak: number;
  longestStreak: number;
  lastUpdated: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  activeToday: boolean;
  missedDays: number;
  dates: string[];
  lastUpdated: string;
  isLoading: boolean;
}

export interface ActivityStats {
  currentStreak: number;
  longestStreak: number;
  missedDays: number;
  activeToday: boolean;
  totalActiveDays: number;
  dates: string[];
}

// LeetCode profile returned from the backend
export interface LeetCodeProfile {
  username: string;
  streak: number;
  totalActiveDays: number;
  activeYears: number[];
  submissionCalendar: string | Record<string, number>;
}

export interface ChallengeInvite {
  id: string;
  challengeId: string;
  challengeName: string;
  inviterId: string;
  inviterName: string;
  senderName?: string;
  inviteeId: string;
  inviteeName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  leetcodeUsername?: string;
}

export interface DashboardResponse {
  summary: {
    totalChallenges: number;
    activeChallenges: number;
    completedChallenges: number;
    totalPenalties: number;
  };
  activeChallenges: Challenge[];
  recentActivity: ActivityData[];
}