import { randomUUID } from "crypto";
import { docClient, TABLES, type LeaderboardEntry } from "../database";
import { PutCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { isDev } from "../utils/env.utils";
import leaderboardMockService from "../mock/leaderboard.mock";

export interface SubmitScoreData {
  user_id: string;
  user_name: string;
  score: number;
}

export class LeaderboardService {
  /**
   * Submit a score to the leaderboard
   */
  static async submitScore(data: SubmitScoreData): Promise<LeaderboardEntry> {
    try {
      // Use mock service for development environment (not local)
      if (isDev()) {
        return await leaderboardMockService.submitScore(data);
      }
      const entry: LeaderboardEntry = {
        id: randomUUID(),
        user_id: data.user_id,
        user_name: data.user_name,
        score: data.score,
        timestamp: Date.now(),
      };

      await docClient.send(new PutCommand({
        TableName: TABLES.LEADERBOARD.name,
        Item: entry,
      }));

        return entry;
    } catch (error: any) {
        console.error("Leaderboard submit score error:", error);
        throw new Error(`Failed to submit score: ${error.message}`);
    }
  }

  /**
   * Get top scores from leaderboard
   */
  static async getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      // Use mock service for development environment (not local)
      if (isDev()) {
        return await leaderboardMockService.getTopScores(limit);
      }
      const response = await docClient.send(new ScanCommand({
        TableName: TABLES.LEADERBOARD.name,
        Limit: limit * 2, // Get more items to sort properly
      }));

      if (!response.Items || response.Items.length === 0) {
        return [];
      }

      // Sort by score descending and take the requested limit
      const sortedEntries = (response.Items as LeaderboardEntry[])
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return sortedEntries;
    } catch (error: any) {
        console.error("Leaderboard get top scores error:", error);
        throw new Error(`Failed to retrieve leaderboard: ${error.message}`);
    }
  }

  /**
   * Get all scores for a specific user
   */
  static async getUserScores(userId: string): Promise<LeaderboardEntry[]> {
    try {
      // Use mock service for development environment (not local)
      if (isDev()) {
        return await leaderboardMockService.getUserScores(userId);
      }
      // First try using GSI if available, otherwise fall back to scan
      let response;
      
      try {
        // Try to use the UserIdIndex GSI
        response = await docClient.send(new QueryCommand({
          TableName: TABLES.LEADERBOARD.name,
          IndexName: "UserIdIndex",
          KeyConditionExpression: "user_id = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
        }));
      } catch (gsiError) {
        console.log("GSI not available, falling back to scan");
        // Fallback to scan with filter
        response = await docClient.send(new ScanCommand({
          TableName: TABLES.LEADERBOARD.name,
          FilterExpression: "user_id = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
        }));
      }

      if (!response.Items || response.Items.length === 0) {
        return [];
      }

      // Sort by timestamp descending (most recent first)
      const userScores = (response.Items as LeaderboardEntry[])
        .sort((a, b) => b.timestamp - a.timestamp);

      return userScores;
    } catch (error: any) {
        console.error("Leaderboard get user scores error", error);
        throw new Error(`Failed to retrieve user scores: ${error.message}`);
    }
  }

  /**
   * Get the best score for a specific user
   */
  static async getUserBestScore(userId: string): Promise<LeaderboardEntry | null> {
    try {
      // Use mock service for development environment (not local)
      if (isDev()) {
        return await leaderboardMockService.getUserBestScore(userId);
      }
      const userScores = await this.getUserScores(userId);
      
      if (userScores.length === 0) {
        return null;
      }

      // Find the highest score
      const bestScore = userScores.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      return bestScore;
    } catch (error: any) {
        console.error("Leaderboard get user best score error", error);
        throw new Error(`Failed to retrieve user best score: ${error.message}`);
    }
  }

  /**
   * Get leaderboard statistics
   */
  static async getLeaderboardStats(): Promise<{
    totalEntries: number;
    highestScore: number;
    averageScore: number;
    totalPlayers: number;
  }> {
    try {
      // Use mock service for development environment (not local)
      if (isDev()) {
        return await leaderboardMockService.getLeaderboardStats();
      }
      const response = await docClient.send(new ScanCommand({
        TableName: TABLES.LEADERBOARD.name,
      }));

      if (!response.Items || response.Items.length === 0) {
        return {
          totalEntries: 0,
          highestScore: 0,
          averageScore: 0,
          totalPlayers: 0,
        };
      }

      const entries = response.Items as LeaderboardEntry[];
      const uniqueUsers = new Set(entries.map(entry => entry.user_id));
      const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0);
      const highestScore = Math.max(...entries.map(entry => entry.score));

      return {
        totalEntries: entries.length,
        highestScore,
        averageScore: Math.round(totalScore / entries.length),
        totalPlayers: uniqueUsers.size,
      };
    } catch (error: any) {
        console.error("Leaderboard get stats error", error);
        throw new Error(`Failed to retrieve leaderboard statistics: ${error.message}`);
    }
  }

  /**
   * Get user ranking
   */
  static async getUserRanking(userId: string): Promise<{
    rank: number | null;
    totalPlayers: number;
    bestScore: number | null;
  }> {
    try {
      // Use mock service for development environment (not local)
      if (isDev()) {
        return await leaderboardMockService.getUserRanking(userId);
      }
      const userBestScore = await this.getUserBestScore(userId);
      if (!userBestScore) {
        return {
          rank: null,
          totalPlayers: 0,
          bestScore: null,
        };
      }

      // Get all unique user best scores
      const allScores = await docClient.send(new ScanCommand({
        TableName: TABLES.LEADERBOARD.name,
      }));

      if (!allScores.Items || allScores.Items.length === 0) {
        return {
          rank: null,
          totalPlayers: 0,
          bestScore: userBestScore.score,
        };
      }

      // Group by user and find best score for each
      const userBestScores = new Map<string, number>();
      for (const item of allScores.Items as LeaderboardEntry[]) {
        const currentBest = userBestScores.get(item.user_id) || 0;
        if (item.score > currentBest) {
          userBestScores.set(item.user_id, item.score);
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
    } catch (error: any) {
        console.error("Leaderboard get user ranking error", error);
        throw new Error(`Failed to retrieve user ranking: ${error.message}`);
    }
  }
}

export const leaderboardService = LeaderboardService;
export default leaderboardService;