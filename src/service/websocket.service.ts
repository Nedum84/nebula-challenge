import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import config from "../config/config";
import { isDev } from "../utils/env.utils";

const webSocketClient = new ApiGatewayManagementApiClient({
  endpoint: config.WEBSOCKET_CONNECTION_URL,
  region: "eu-north-1",
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

export interface HighScoreNotification {
  type: "HIGH_SCORE_ACHIEVEMENT";
  data: {
    user_id: string;
    user_name: string;
    score: number;
    timestamp: number;
    message: string;
  };
}

const sendHighScoreNotification = async (
  connectionId: string,
  notification: HighScoreNotification
): Promise<boolean> => {
  try {
    // Skip WebSocket operations in development environment
    if (isDev()) {
      console.log(`[WebSocket Mock] Would send to ${connectionId}:`, notification);
      return true;
    }
    const message = JSON.stringify(notification);

    const command = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: Buffer.from(message, "utf8"),
    });

    await webSocketClient.send(command);
    console.log(`High score notification sent to connection ${connectionId}:`, notification);
    return true;
  } catch (error: any) {
    console.error("WebSocket notification error:", error);
    
    // Connection might be stale
    if (error.statusCode === 410) {
      console.log(`Connection ${connectionId} is no longer available`);
      return false;
    }
    
    throw new Error(`Failed to send WebSocket notification: ${error.message}`);
  }
};

const broadcastHighScoreNotification = async (
  connectionIds: string[],
  user_id: string,
  user_name: string,
  score: number
): Promise<{ sent: number; failed: number }> => {
  const notification: HighScoreNotification = {
    type: "HIGH_SCORE_ACHIEVEMENT",
    data: {
      user_id,
      user_name,
      score,
      timestamp: Date.now(),
      message: `🎉 ${user_name} achieved a high score of ${score}!`,
    },
  };

  let sent = 0;
  let failed = 0;

  const promises = connectionIds.map(async (connectionId) => {
    try {
      const success = await sendHighScoreNotification(connectionId, notification);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
      console.error(`Failed to send to connection ${connectionId}:`, error);
    }
  });

  await Promise.allSettled(promises);

  console.log(`Broadcast complete: ${sent} sent, ${failed} failed`);
  return { sent, failed };
};

// For testing purposes - in a real app, you'd manage connections in DynamoDB
let mockConnections: string[] = [];

const addMockConnection = (connectionId: string): void => {
  if (!mockConnections.includes(connectionId)) {
    mockConnections.push(connectionId);
    console.log(`Mock connection added: ${connectionId}`);
  }
};

const removeMockConnection = (connectionId: string): void => {
  mockConnections = mockConnections.filter(id => id !== connectionId);
  console.log(`Mock connection removed: ${connectionId}`);
};

const getMockConnections = (): string[] => {
  return [...mockConnections];
};

const sendHighScoreNotificationToAll = async (
  user_id: string,
  user_name: string,
  score: number
): Promise<{ sent: number; failed: number }> => {
  const connections = getMockConnections();
  
  if (connections.length === 0) {
    console.log("No active connections to send notifications");
    return { sent: 0, failed: 0 };
  }

  return await broadcastHighScoreNotification(connections, user_id, user_name, score);
};

export const webSocketService = {
  sendHighScoreNotification,
  broadcastHighScoreNotification,
  sendHighScoreNotificationToAll,
  addMockConnection,
  removeMockConnection,
  getMockConnections,
};