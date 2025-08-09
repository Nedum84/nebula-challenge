export interface LeaderboardEntry {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  timestamp: number;
}

export interface ScoreSubmission {
  score: number;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  status: number;
  success: false;
  message: string;
  errorCode?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}