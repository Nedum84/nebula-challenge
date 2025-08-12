import api from './api.service';
import { LeaderboardEntry, ScoreSubmission, ApiResponse } from '../types/leaderboard.types';

class LeaderboardService {
  async submitScore(data: ScoreSubmission): Promise<ApiResponse<LeaderboardEntry>> {
    const response = await api.post('/v1/leaderboard/submit', data);
    return response.data;
  }

  async getLeaderboard(limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    const response = await api.get(`/v1/leaderboard?limit=${limit}`);
    return response.data;
  }

  async getTopScore(): Promise<ApiResponse<LeaderboardEntry[]>> {
    const response = await api.get('/v1/leaderboard/top');
    return response.data;
  }

  async getUserScores(): Promise<ApiResponse<LeaderboardEntry[]>> {
    const response = await api.get('/v1/leaderboard/user/scores');
    return response.data;
  }

  async getUserBestScore(): Promise<ApiResponse<LeaderboardEntry>> {
    const response = await api.get('/v1/leaderboard/user/best');
    return response.data;
  }
}

const leaderboardService = new LeaderboardService();
export default leaderboardService;