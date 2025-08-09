export { DbManager, TABLES, docClient, rawClient, cognitoClient } from "./db.init";
export { SeedData, type LeaderboardEntry } from "./seeds";

export type {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
} from "@aws-sdk/client-dynamodb";

export type {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";