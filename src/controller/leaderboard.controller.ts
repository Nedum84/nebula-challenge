import { Request, Response } from "express";
import { SuccessResponse } from "../api-response";
import { dynamoDBService } from "../service/dynamodb.service";
import { webSocketService } from "../service/websocket.service";
import { CognitoUserContext } from "../middlewares/auth.middleware";

const submitScore = async (req: Request, res: Response) => {
  const { score } = req.body;
  const user = CognitoUserContext.use();
  
  if (!user) {
    throw new Error("User not found in context");
  }

  // Submit score to DynamoDB
  const result = await dynamoDBService.submitScore({
    user_id: user.user_id,
    user_name: user.name,
    score: score,
  });

  // Send WebSocket notification if score > 1000
  if (score > 1000) {
    try {
      await webSocketService.sendHighScoreNotificationToAll(
        user.user_id,
        user.name,
        score
      );
      console.log(`High score notification sent for ${user.name} with score ${score}`);
    } catch (error) {
      console.error("Failed to send WebSocket notification:", error);
      // Don't fail the request if notification fails
    }
  }

  SuccessResponse.created(res, result, "Score submitted successfully");
};

const getLeaderboard = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await dynamoDBService.getTopScores(limit);

  SuccessResponse.ok(res, result, "Leaderboard retrieved successfully");
};

const getTopScore = async (req: Request, res: Response) => {
  // Get top 1 score as requested in the challenge
  const result = await dynamoDBService.getTopScores(1);

  SuccessResponse.ok(res, result, "Top score retrieved successfully");
};

const getUserScores = async (req: Request, res: Response) => {
  const user = CognitoUserContext.use();
  
  if (!user) {
    throw new Error("User not found in context");
  }

  const result = await dynamoDBService.getUserScores(user.user_id);

  SuccessResponse.ok(res, result, "User scores retrieved successfully");
};

const getUserBestScore = async (req: Request, res: Response) => {
  const user = CognitoUserContext.use();
  
  if (!user) {
    throw new Error("User not found in context");
  }

  const result = await dynamoDBService.getUserBestScore(user.user_id);

  SuccessResponse.ok(res, result || {}, "User best score retrieved successfully");
};

export const leaderboardController = {
  submitScore,
  getLeaderboard,
  getTopScore,
  getUserScores,
  getUserBestScore,
};