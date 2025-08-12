import {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand as DocScanCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import config from "../config/config";
import { isLocal } from "../utils/env.utils";

// DynamoDB Client Configuration
const dynamoClient = new DynamoDBClient({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
  // ...(config.USE_LOCAL_DYNAMODB && {
  //   endpoint: config.DYNAMODB_LOCAL_ENDPOINT,
  // }),
});

// Document Client for easier operations
export const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Raw client for table operations
export const rawClient = dynamoClient;

// Cognito Client Configuration
export const cognitoClient = new CognitoIdentityProviderClient({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

// Table Definitions
export const TABLES = {
  LEADERBOARD: {
    name: config.DYNAMODB_LEADERBOARD_TABLE,
    schema: {
      TableName: config.DYNAMODB_LEADERBOARD_TABLE,
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH", // Partition key
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
        {
          AttributeName: "user_id",
          AttributeType: "S",
        },
        {
          AttributeName: "score",
          AttributeType: "N",
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "UserIdIndex",
          KeySchema: [
            {
              AttributeName: "user_id",
              KeyType: "HASH",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
          BillingMode: "PAY_PER_REQUEST" as any,
        },
        {
          IndexName: "ScoreIndex",
          KeySchema: [
            {
              AttributeName: "score",
              KeyType: "HASH",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
          BillingMode: "PAY_PER_REQUEST" as any,
        },
      ],
      BillingMode: "PAY_PER_REQUEST" as any,
    },
  },
} as const;

// Utility Functions
export class DbManager {
  /**
   * Check if a table exists
   */
  static async tableExists(tableName: string): Promise<boolean> {
    try {
      await rawClient.send(new DescribeTableCommand({ TableName: tableName }));
      return true;
    } catch (error: any) {
      if (error.name === "ResourceNotFoundException") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Create a table
   */
  static async createTable(tableSchema: any): Promise<boolean> {
    try {
      const exists = await this.tableExists(tableSchema.TableName);
      if (exists) {
        console.log(`Table ${tableSchema.TableName} already exists`);
        return true;
      }

      await rawClient.send(new CreateTableCommand(tableSchema));
      console.log(`Table ${tableSchema.TableName} created successfully`);

      // Wait for table to be active
      await this.waitForTable(tableSchema.TableName, "ACTIVE");
      return true;
    } catch (error: any) {
      console.error(`Error creating table ${tableSchema.TableName}:`, error.message);
      return false;
    }
  }

  /**
   * Delete a table
   */
  static async deleteTable(tableName: string): Promise<boolean> {
    try {
      const exists = await this.tableExists(tableName);
      if (!exists) {
        console.log(`Table ${tableName} does not exist`);
        return true;
      }

      await rawClient.send(new DeleteTableCommand({ TableName: tableName }));
      console.log(`Table ${tableName} deleted successfully`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting table ${tableName}:`, error.message);
      return false;
    }
  }

  /**
   * List all tables
   */
  static async listTables(): Promise<string[]> {
    try {
      const response = await rawClient.send(new ListTablesCommand({}));
      return response.TableNames || [];
    } catch (error: any) {
      console.error("Error listing tables:", error.message);
      return [];
    }
  }

  /**
   * Wait for table to reach desired state
   */
  static async waitForTable(tableName: string, desiredState: string): Promise<void> {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await rawClient.send(new DescribeTableCommand({ TableName: tableName }));
        const currentState = response.Table?.TableStatus;

        if (currentState === desiredState) {
          console.log(`Table ${tableName} is now ${desiredState}`);
          return;
        }

        console.log(
          `Waiting for table ${tableName} to become ${desiredState}. Current state: ${currentState}`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        attempts++;
      } catch (error: any) {
        if (error.name === "ResourceNotFoundException" && desiredState === "DELETED") {
          console.log(`Table ${tableName} has been deleted`);
          return;
        }
        throw error;
      }
    }

    throw new Error(`Table ${tableName} did not reach ${desiredState} state within timeout`);
  }

  /**
   * Clear all data from a table
   */
  static async clearTable(tableName: string): Promise<boolean> {
    try {
      const exists = await this.tableExists(tableName);
      if (!exists) {
        console.log(`Table ${tableName} does not exist`);
        return true;
      }

      // Scan and delete all items
      let items: any[] = [];
      let lastEvaluatedKey: any = undefined;

      do {
        const scanCommand = new DocScanCommand({
          TableName: tableName,
          ExclusiveStartKey: lastEvaluatedKey,
        });

        const response = await docClient.send(scanCommand);

        if (response.Items) {
          items = items.concat(response.Items);
        }
        lastEvaluatedKey = response.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      if (items.length === 0) {
        console.log(`Table ${tableName} is already empty`);
        return true;
      }

      // Delete items in batches of 25 (DynamoDB limit)
      const batchSize = 25;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const deleteRequests = batch.map((item) => ({
          DeleteRequest: {
            Key: { id: item.id }, // Assuming 'id' is the primary key
          },
        }));

        await docClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: deleteRequests,
            },
          })
        );
      }

      console.log(`Cleared ${items.length} items from table ${tableName}`);
      return true;
    } catch (error: any) {
      console.error(`Error clearing table ${tableName}:`, error.message);
      return false;
    }
  }

  /**
   * Initialize all tables
   */
  static async initializeTables(): Promise<boolean> {
    try {
      console.log("Initializing DynamoDB tables...");

      const results = await Promise.all([this.createTable(TABLES.LEADERBOARD.schema)]);

      const allSuccess = results.every((result) => result === true);

      if (allSuccess) {
        console.log("All tables initialized successfully");
      } else {
        console.log("Some tables failed to initialize");
      }

      return allSuccess;
    } catch (error: any) {
      console.error("Error initializing tables:", error.message);
      return false;
    }
  }

  /**
   * Drop all tables
   */
  static async dropAllTables(): Promise<boolean> {
    try {
      console.log("Dropping all DynamoDB tables...");

      const results = await Promise.all([this.deleteTable(TABLES.LEADERBOARD.name)]);

      const allSuccess = results.every((result) => result === true);

      if (allSuccess) {
        console.log("All tables dropped successfully");
      } else {
        console.log("Some tables failed to drop");
      }

      return allSuccess;
    } catch (error: any) {
      console.error("Error dropping tables:", error.message);
      return false;
    }
  }

  /**
   * Reset database (drop and recreate all tables)
   */
  static async resetDatabase(): Promise<boolean> {
    try {
      console.log("Resetting database...");

      await this.dropAllTables();
      // Wait a moment for tables to be fully deleted
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const success = await this.initializeTables();

      if (success) {
        console.log("Database reset successfully");
      } else {
        console.log("Database reset failed");
      }

      return success;
    } catch (error: any) {
      console.error("Error resetting database:", error.message);
      return false;
    }
  }
}

export default DbManager;
