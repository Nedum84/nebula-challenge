import { randomUUID } from "crypto";
import { LeaderboardEntry } from "../database";
import { SubmitScoreData } from "../service/leaderboard.service";

interface RedisStorage {
  leaderboard: LeaderboardEntry[];
}

class LeaderboardMockService {
  private redis: any;
  private connected: boolean = false;
  private readonly STORAGE_KEY = "nebula:mock:leaderboard";

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    if (!process.env.REDIS_URL) {
      console.warn("[LeaderboardMock] No REDIS_URL provided, mock will use in-memory storage");
      return;
    }

    try {
      const Redis = require('redis');
      this.redis = Redis.createClient({ url: process.env.REDIS_URL });
      
      this.redis.on('connect', () => {
        this.connected = true;
        console.log('[LeaderboardMock] Connected to Redis');
      });
      
      this.redis.on('error', (err: any) => {
        console.error('[LeaderboardMock] Redis connection error:', err);
        this.connected = false;
      });
      
      await this.redis.connect();
      
      // Initialize with seed data if empty
      await this.seedDefaultData();
    } catch (error) {
      console.error('[LeaderboardMock] Failed to connect to Redis:', error);
      this.connected = false;
    }
  }

  private async getStorage(): Promise<RedisStorage> {
    if (!this.redis || !this.connected) {
      // Fallback to empty storage
      return { leaderboard: [] };
    }

    try {
      const data = await this.redis.get(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[LeaderboardMock] Error reading from Redis:', error);
    }

    return { leaderboard: [] };
  }

  private async setStorage(storage: RedisStorage): Promise<void> {
    if (!this.redis || !this.connected) {
      console.warn('[LeaderboardMock] Cannot save to Redis - not connected');
      return;
    }

    try {
      await this.redis.set(this.STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
      console.error('[LeaderboardMock] Error writing to Redis:', error);
    }
  }

  private async seedDefaultData(): Promise<void> {
    const storage = await this.getStorage();
    
    // Only seed if empty
    if (storage.leaderboard.length > 0) {
      console.log(`[LeaderboardMock] Data already exists with ${storage.leaderboard.length} entries`);
      return;
    }

    // Add some default leaderboard entries
    const defaultScores = [
      { user_id: "default-user-1", user_name: "Player1", score: 9500 },
      { user_id: "default-user-2", user_name: "Player2", score: 8750 },
      { user_id: "default-user-3", user_name: "Player3", score: 7200 },
      { user_id: "default-user-1", user_name: "Player1", score: 8900 },
      { user_id: "default-user-2", user_name: "Player2", score: 8100 },
    ];

    storage.leaderboard = defaultScores.map(scoreData => ({
      id: randomUUID(),
      user_id: scoreData.user_id,
      user_name: scoreData.user_name,
      score: scoreData.score,
      timestamp: Date.now() - Math.random() * 86400000 * 7, // Random time within last week
    }));

    await this.setStorage(storage);
    console.log(`[LeaderboardMock] Seeded ${storage.leaderboard.length} default entries`);
  }

  async submitScore(data: SubmitScoreData): Promise<LeaderboardEntry> {
    const entry: LeaderboardEntry = {
      id: randomUUID(),
      user_id: data.user_id,
      user_name: data.user_name,
      score: data.score,
      timestamp: Date.now(),
    };

    const storage = await this.getStorage();
    storage.leaderboard.push(entry);
    await this.setStorage(storage);

    console.log(`[LeaderboardMock] Score submitted: ${data.user_name} - ${data.score}`);
    return entry;
  }

  async getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
    const storage = await this.getStorage();
    return storage.leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getUserScores(userId: string): Promise<LeaderboardEntry[]> {
    const storage = await this.getStorage();
    return storage.leaderboard
      .filter((entry) => entry.user_id === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async getUserBestScore(userId: string): Promise<LeaderboardEntry | null> {
    const userScores = await this.getUserScores(userId);
    
    if (userScores.length === 0) {
      return null;
    }

    return userScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  }

  async getLeaderboardStats(): Promise<{
    totalEntries: number;
    highestScore: number;
    averageScore: number;
    totalPlayers: number;
  }> {
    const storage = await this.getStorage();
    const entries = storage.leaderboard;
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        highestScore: 0,
        averageScore: 0,
        totalPlayers: 0,
      };
    }

    const uniqueUsers = new Set(entries.map(entry => entry.user_id));
    const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0);
    const highestScore = Math.max(...entries.map(entry => entry.score));

    return {
      totalEntries: entries.length,
      highestScore,
      averageScore: Math.round(totalScore / entries.length),
      totalPlayers: uniqueUsers.size,
    };
  }

  async getUserRanking(userId: string): Promise<{
    rank: number | null;
    totalPlayers: number;
    bestScore: number | null;
  }> {
    const userBestScore = await this.getUserBestScore(userId);
    if (!userBestScore) {
      return {
        rank: null,
        totalPlayers: 0,
        bestScore: null,
      };
    }

    const storage = await this.getStorage();
    
    // Group by user and find best score for each
    const userBestScores = new Map<string, number>();
    for (const entry of storage.leaderboard) {
      const currentBest = userBestScores.get(entry.user_id) || 0;
      if (entry.score > currentBest) {
        userBestScores.set(entry.user_id, entry.score);
      }
    }

    // Sort scores descending and find user rank
    const sortedScores = Array.from(userBestScores.values()).sort((a, b) => b - a);
    const userScore = userBestScores.get(userId) || 0;
    const rank = sortedScores.indexOf(userScore) + 1;

    return {
      rank: rank > 0 ? rank : null,
      totalPlayers: userBestScores.size,
      bestScore: userScore,
    };
  }
}

// Export a singleton instance
export const leaderboardMockService = new LeaderboardMockService();
export default leaderboardMockService;