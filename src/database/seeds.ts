import { randomUUID } from "crypto";
import { docClient } from "./db.init";
import config from "../config/config";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  timestamp: number;
}

export class SeedData {
  static generateLeaderboardEntries(count: number = 20): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];
    const sampleUsers = [
      { id: "user_001", name: "Alice Johnson" },
      { id: "user_002", name: "Bob Smith" },
      { id: "user_003", name: "Carol Brown" },
      { id: "user_004", name: "David Wilson" },
      { id: "user_005", name: "Emma Davis" },
      { id: "user_006", name: "Frank Miller" },
      { id: "user_007", name: "Grace Lee" },
      { id: "user_008", name: "Henry Taylor" },
      { id: "user_009", name: "Isabella Clark" },
      { id: "user_010", name: "Jack Anderson" },
      { id: "user_011", name: "Kate White" },
      { id: "user_012", name: "Liam Harris" },
      { id: "user_013", name: "Mia Martin" },
      { id: "user_014", name: "Noah Garcia" },
      { id: "user_015", name: "Olivia Rodriguez" },
    ];

    for (let i = 0; i < count; i++) {
      const user = sampleUsers[i % sampleUsers.length];
      const baseScore = Math.floor(Math.random() * 5000) + 100;
      const timestamp = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);

      entries.push({
        id: randomUUID(),
        user_id: `${user.id}_${i}`,
        user_name: `${user.name}${i > sampleUsers.length - 1 ? ` #${Math.floor(i / sampleUsers.length) + 1}` : ''}`,
        score: baseScore,
        timestamp,
      });
    }

    return entries.sort((a, b) => b.score - a.score);
  }

  static generateHighScoreEntries(count: number = 5): LeaderboardEntry[] {
    const entries = this.generateLeaderboardEntries(count);
    return entries.map((entry, index) => ({
      ...entry,
      score: 1000 + Math.floor(Math.random() * 4000) + (index * 100),
    }));
  }

  static async seedLeaderboard(count: number = 20): Promise<boolean> {
    try {
      console.log(`Seeding leaderboard with ${count} entries...`);
      
      const entries = this.generateLeaderboardEntries(count);
      
      const batchSize = 10;
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(entry =>
            docClient.send(new PutCommand({
              TableName: config.DYNAMODB_LEADERBOARD_TABLE,
              Item: entry,
            }))
          )
        );
        
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entries.length / batchSize)}`);
        
        if (i + batchSize < entries.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Successfully seeded ${entries.length} leaderboard entries`);
      return true;
    } catch (error: any) {
      console.error("Error seeding leaderboard:", error.message);
      return false;
    }
  }

  static async seedHighScores(count: number = 5): Promise<boolean> {
    try {
      console.log(`Seeding ${count} high-score entries...`);
      
      const entries = this.generateHighScoreEntries(count);
      
      for (const entry of entries) {
        await docClient.send(new PutCommand({
          TableName: config.DYNAMODB_LEADERBOARD_TABLE,
          Item: entry,
        }));
        
        console.log(`Added high score: ${entry.user_name} - ${entry.score}`);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      console.log(`Successfully seeded ${entries.length} high-score entries`);
      return true;
    } catch (error: any) {
      console.error("Error seeding high scores:", error.message);
      return false;
    }
  }

  static async seedUserScores(userId: string, userName: string, scoreCount: number = 5): Promise<boolean> {
    try {
      console.log(`Seeding ${scoreCount} scores for user ${userName}...`);
      
      const scores: LeaderboardEntry[] = [];
      for (let i = 0; i < scoreCount; i++) {
        scores.push({
          id: randomUUID(),
          user_id: userId,
          user_name: userName,
          score: Math.floor(Math.random() * 3000) + 200,
          timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
        });
      }

      for (const score of scores) {
        await docClient.send(new PutCommand({
          TableName: config.DYNAMODB_LEADERBOARD_TABLE,
          Item: score,
        }));
      }

      console.log(`Successfully seeded ${scores.length} scores for user ${userName}`);
      return true;
    } catch (error: any) {
      console.error(`Error seeding user scores for ${userName}:`, error.message);
      return false;
    }
  }

  static async seedAll(): Promise<boolean> {
    try {
      console.log("Seeding all sample data...");
      
      const results = await Promise.all([
        this.seedLeaderboard(25),
        this.seedHighScores(8),
        this.seedUserScores("test_user_001", "Test User Alpha", 7),
        this.seedUserScores("test_user_002", "Test User Beta", 5),
        this.seedUserScores("test_user_003", "Test User Gamma", 3),
      ]);

      const allSuccess = results.every(result => result === true);
      
      if (allSuccess) {
        console.log("All seed data inserted successfully");
      } else {
        console.log("Some seed operations failed");
      }

      return allSuccess;
    } catch (error: any) {
      console.error("Error seeding all data:", error.message);
      return false;
    }
  }
}

export default SeedData;