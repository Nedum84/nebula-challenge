import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand as DocScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import config from "../config/config";

const dynamoClient = new DynamoDBClient({
  region: "eu-north-1",
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  timestamp: number;
}

export interface SubmitScoreData {
  user_id: string;
  user_name: string;
  score: number;
}

const submitScore = async (data: SubmitScoreData): Promise<LeaderboardEntry> => {
  try {
    const entry: LeaderboardEntry = {
      id: randomUUID(),
      user_id: data.user_id,
      user_name: data.user_name,
      score: data.score,
      timestamp: Date.now(),
    };

    const command = new PutCommand({
      TableName: config.DYNAMODB_LEADERBOARD_TABLE,
      Item: entry,
    });

    await docClient.send(command);
    
    console.log("Score submitted to DynamoDB:", entry);
    return entry;
  } catch (error: any) {
    console.error("DynamoDB submit score error:", error);
    throw new Error(`Failed to submit score: ${error.message}`);
  }
};

const getTopScores = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const command = new DocScanCommand({
      TableName: config.DYNAMODB_LEADERBOARD_TABLE,
    });

    const response = await docClient.send(command);
    
    if (!response.Items) {
      return [];
    }

    // Sort by score in descending order and get top N
    const sortedEntries = (response.Items as LeaderboardEntry[])
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sortedEntries;
  } catch (error: any) {
    console.error("DynamoDB get top scores error:", error);
    throw new Error(`Failed to retrieve leaderboard: ${error.message}`);
  }
};

const getUserScores = async (user_id: string): Promise<LeaderboardEntry[]> => {
  try {
    const command = new DocScanCommand({
      TableName: config.DYNAMODB_LEADERBOARD_TABLE,
      FilterExpression: "user_id = :user_id",
      ExpressionAttributeValues: {
        ":user_id": user_id,
      },
    });

    const response = await docClient.send(command);
    
    if (!response.Items) {
      return [];
    }

    // Sort by timestamp in descending order (most recent first)
    const userScores = (response.Items as LeaderboardEntry[])
      .sort((a, b) => b.timestamp - a.timestamp);

    return userScores;
  } catch (error: any) {
    console.error("DynamoDB get user scores error:", error);
    throw new Error(`Failed to retrieve user scores: ${error.message}`);
  }
};

const getUserBestScore = async (user_id: string): Promise<LeaderboardEntry | null> => {
  try {
    const userScores = await getUserScores(user_id);
    
    if (userScores.length === 0) {
      return null;
    }

    // Find the highest score
    const bestScore = userScores.reduce((max, current) => 
      current.score > max.score ? current : max
    );

    return bestScore;
  } catch (error: any) {
    console.error("DynamoDB get user best score error:", error);
    throw new Error(`Failed to retrieve user best score: ${error.message}`);
  }
};

export const dynamoDBService = {
  submitScore,
  getTopScores,
  getUserScores,
  getUserBestScore,
};