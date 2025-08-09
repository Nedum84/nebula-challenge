import config from "../config/config";
import { DbManager, SeedData, cognitoClient } from "../database";
import {
  ListUsersCommand,
  AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

// ============= DynamoDB Operations =============

const dbInit = async () => {
  try {
    console.log("🚀 Initializing DynamoDB tables...");
    const success = await DbManager.initializeTables();
    const message = success
      ? "✅ Database initialized successfully"
      : "❌ Database initialization failed";
    console.log(message);
    return message;
  } catch (error: any) {
    console.error("❌ Error initializing database:", error.message);
    throw error;
  }
};

const dbDrop = async () => {
  try {
    console.log("🗑️  Dropping all DynamoDB tables...");
    const success = await DbManager.dropAllTables();
    const message = success
      ? "✅ All tables dropped successfully"
      : "❌ Failed to drop some tables";
    console.log(message);
    return message;
  } catch (error: any) {
    console.error("❌ Error dropping tables:", error.message);
    throw error;
  }
};

const dbReset = async () => {
  try {
    console.log("🔄 Resetting database (drop + recreate)...");
    const success = await DbManager.resetDatabase();
    const message = success ? "✅ Database reset successfully" : "❌ Database reset failed";
    console.log(message);
    return message;
  } catch (error: any) {
    console.error("❌ Error resetting database:", error.message);
    throw error;
  }
};

const dbStatus = async () => {
  try {
    console.log("📊 Checking database status...");
    const tables = await DbManager.listTables();
    const tableStatuses = await Promise.all(
      tables.map(async (tableName) => {
        const exists = await DbManager.tableExists(tableName);
        return `  ${tableName}: ${exists ? "✅ EXISTS" : "❌ MISSING"}`;
      })
    );

    const message = `Database Status:\n${tableStatuses.join("\n")}\nTotal tables: ${tables.length}`;
    console.log(message);
    return message;
  } catch (error: any) {
    console.error("❌ Error checking database status:", error.message);
    throw error;
  }
};

const dbClear = async () => {
  try {
    console.log("🧹 Clearing all data from tables...");
    const tables = await DbManager.listTables();
    const results = await Promise.all(tables.map((tableName) => DbManager.clearTable(tableName)));

    const success = results.every((result) => result === true);
    const message = success
      ? "✅ All tables cleared successfully"
      : "❌ Failed to clear some tables";
    console.log(message);
    return message;
  } catch (error: any) {
    console.error("❌ Error clearing tables:", error.message);
    throw error;
  }
};

// ============= Seeding Operations =============

const dbSeedAll = async () => {
  try {
    console.log("🌱 Seeding all sample data...");
    const success = await SeedData.seedAll();
    const message = success
      ? "✅ All seed data inserted successfully"
      : "❌ Some seed operations failed";
    console.log(message);
    return message;
  } catch (error: any) {
    console.error("❌ Error seeding data:", error.message);
    throw error;
  }
};

const dbSeedLeaderboard = async (args?: { count?: number }) => {
  try {
    const count = args?.count || 25;
    console.log(`🏆 Seeding ${count} leaderboard entries...`);
    const success = await SeedData.seedLeaderboard(count);
    const message = success
      ? `✅ ${count} leaderboard entries seeded successfully`
      : "❌ Leaderboard seeding failed";
    console.log(message);
    return message;
  } catch (error: any) {
    console.error("❌ Error seeding leaderboard:", error.message);
    throw error;
  }
};

const dbSeedHighScores = async (args?: { count?: number }) => {
  try {
    const count = args?.count || 8;
    console.log(`🎯 Seeding ${count} high-score entries...`);
    const success = await SeedData.seedHighScores(count);
    const message = success
      ? `✅ ${count} high-score entries seeded successfully`
      : "❌ High-score seeding failed";
    console.log(message);
    return message;
  } catch (error: any) {
    console.error("❌ Error seeding high scores:", error.message);
    throw error;
  }
};

const dbSeedUser = async (args: { userId: string; userName: string; count?: number }) => {
  try {
    const count = args.count || 5;
    console.log(`👤 Seeding ${count} scores for user ${args.userName}...`);
    const success = await SeedData.seedUserScores(args.userId, args.userName, count);
    const message = success
      ? `✅ ${count} scores seeded for user ${args.userName}`
      : `❌ User score seeding failed for ${args.userName}`;
    console.log(message);
    return message;
  } catch (error: any) {
    console.error(`❌ Error seeding user scores for ${args.userName}:`, error.message);
    throw error;
  }
};

// ============= Cognito Operations =============

const cognitoListUsers = async () => {
  try {
    console.log("👥 Listing Cognito users...");
    const response = await cognitoClient.send(
      new ListUsersCommand({
        UserPoolId: config.COGNITO_USER_POOL_ID,
        Limit: 50,
      })
    );

    const users = response.Users || [];
    const userList = users.map((user) => ({
      username: user.Username,
      email: user.Attributes?.find((attr) => attr.Name === "email")?.Value,
      status: user.UserStatus,
      created: user.UserCreateDate,
    }));

    console.log(`Found ${users.length} users:`);
    userList.forEach((user) => {
      console.log(`  - ${user.username} (${user.email}) - ${user.status}`);
    });

    return { count: users.length, users: userList };
  } catch (error: any) {
    console.error("❌ Error listing Cognito users:", error.message);
    throw error;
  }
};

const cognitoClearUsers = async () => {
  try {
    console.log("🗑️  Clearing all Cognito users...");

    const listResponse = await cognitoClient.send(
      new ListUsersCommand({
        UserPoolId: config.COGNITO_USER_POOL_ID,
      })
    );

    const users = listResponse.Users || [];

    if (users.length === 0) {
      console.log("No users found to delete");
      return "No users found to delete";
    }

    let deletedCount = 0;
    for (const user of users) {
      try {
        await cognitoClient.send(
          new AdminDeleteUserCommand({
            UserPoolId: config.COGNITO_USER_POOL_ID,
            Username: user.Username!,
          })
        );
        console.log(`  ✅ Deleted user: ${user.Username}`);
        deletedCount++;
      } catch (deleteError: any) {
        console.log(`  ❌ Failed to delete user ${user.Username}: ${deleteError.message}`);
      }
    }

    const message = `✅ Deleted ${deletedCount} out of ${users.length} users`;
    console.log(message);
    return message;
  } catch (error: any) {
    console.error("❌ Error clearing Cognito users:", error.message);
    throw error;
  }
};

const cognitoDeleteUser = async (args: { username: string }) => {
  try {
    console.log(`🗑️  Deleting Cognito user: ${args.username}...`);

    await cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: config.COGNITO_USER_POOL_ID,
        Username: args.username,
      })
    );

    const message = `✅ User ${args.username} deleted successfully`;
    console.log(message);
    return message;
  } catch (error: any) {
    console.error(`❌ Error deleting user ${args.username}:`, error.message);
    throw error;
  }
};

// ============= Utility Operations =============

const systemStatus = async () => {
  try {
    console.log("🔍 Checking system status...");

    // Check DynamoDB
    const tables = await DbManager.listTables();
    const dbStatus = tables.length > 0 ? "✅ Connected" : "❌ No tables found";

    // Check Cognito
    let cognitoStatus = "❌ Connection failed";
    try {
      const cognitoResponse = await cognitoClient.send(
        new ListUsersCommand({
          UserPoolId: config.COGNITO_USER_POOL_ID,
          Limit: 1,
        })
      );
      cognitoStatus = "✅ Connected";
    } catch (cognitoError) {
      // Keep default error status
    }

    const status = {
      environment: config.NODE_ENV,
      aws_region: config.AWS_REGION,
      dynamodb: dbStatus,
      cognito: cognitoStatus,
      tables: tables,
    };

    console.log("System Status:");
    console.log(`  Environment: ${status.environment}`);
    console.log(`  AWS Region: ${status.aws_region}`);
    console.log(`  DynamoDB: ${status.dynamodb}`);
    console.log(`  Cognito: ${status.cognito}`);
    console.log(`  Tables: ${status.tables.join(", ") || "None"}`);

    return status;
  } catch (error: any) {
    console.error("❌ Error checking system status:", error.message);
    throw error;
  }
};

const help = () => {
  const helpText = `
🚀 Nebula Assessment CLI Commands

📊 Database Operations:
  db:init              - Initialize all DynamoDB tables
  db:drop              - Drop all DynamoDB tables
  db:reset             - Reset database (drop + recreate)
  db:clear             - Clear all data from tables
  db:status            - Check database table status

🌱 Seeding Operations:
  db:seed:all          - Seed all sample data
  db:seed:leaderboard  - Seed leaderboard data (default: 25 entries)
  db:seed:highscores   - Seed high-score data (default: 8 entries)
  db:seed:user         - Seed user scores (requires userId, userName)

👥 Cognito Operations:
  cognito:list         - List all Cognito users
  cognito:clear        - Delete all Cognito users
  cognito:delete       - Delete specific user (requires username)

🔧 System Operations:
  system:status        - Check overall system status
  help                 - Show this help message

📝 Usage Examples:
  npm run cli db:init
  npm run cli db:seed:leaderboard --count=50
  npm run cli cognito:list
  npm run cli system:status
`;

  console.log(helpText);
  return helpText;
};

// ============= Command Handler =============

const handler = async function (event: any, context?: any, callback?: any) {
  const env = config.NODE_ENV;
  console.log("🎮 Nebula Assessment CLI");
  console.log("Arguments:", event);

  const command = typeof event === "string" ? event : event.fn || event.command;
  const args = typeof event === "object" ? event : {};

  console.log(`⚡ Running "${command}" in ${env} mode`);

  let handle: Function | undefined;

  // Determine available commands based on environment
  if (["development", "staging", "test", "local"].includes(env!)) {
    const all = { ...register, ...registerDev };
    handle = all[command];
  } else {
    handle = register[command];
  }

  try {
    let result = "";

    if (handle) {
      result = await handle(args, callback, context);
    } else {
      const errorMsg = `❌ Command "${command}" not found in environment "${env}"`;
      console.log(errorMsg);
      console.log("💡 Run 'npm run cli help' to see available commands");
      result = errorMsg;
    }

    if (callback) {
      callback(null, result);
    }

    return result;
  } catch (error: any) {
    const errorMsg = `❌ Command failed: ${error.message}`;
    console.error(errorMsg);

    if (callback) {
      callback(error);
    }

    throw error;
  }
};

// ============= Command Registration =============

// Production-safe commands
const register: Record<string, Function> = {
  "db:init": dbInit,
  "db:status": dbStatus,
  "system:status": systemStatus,
  help,
};

// Development-only commands (potentially destructive)
const registerDev: Record<string, Function> = {
  "db:drop": dbDrop,
  "db:reset": dbReset,
  "db:clear": dbClear,
  "db:seed:all": dbSeedAll,
  "db:seed:leaderboard": dbSeedLeaderboard,
  "db:seed:highscores": dbSeedHighScores,
  "db:seed:user": dbSeedUser,
  "cognito:list": cognitoListUsers,
  "cognito:clear": cognitoClearUsers,
  "cognito:delete": cognitoDeleteUser,
};

export { register, registerDev, handler };
export default handler;
