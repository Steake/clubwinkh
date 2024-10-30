export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  avatar?: string;
  badges: string[];
  lastActive: string;
}

export interface LeaderboardPeriod {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
}