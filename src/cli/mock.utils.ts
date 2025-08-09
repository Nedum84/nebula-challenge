import CognitoMockService from "../service/cognito.mock";
import { isLocal } from "../utils/env.utils";

export const mockCommands = {
  "mock:users:list": async () => {
    if (!isLocal()) {
      console.log("❌ Mock commands only available in local environment");
      return;
    }

    const users = CognitoMockService.getAllUsers();
    console.log("👥 Mock Users:");
    if (users.length === 0) {
      console.log("  No users found");
    } else {
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.name}) - ${user.confirmed ? '✅ Confirmed' : '⏳ Pending'}`);
      });
    }
  },

  "mock:users:clear": async () => {
    if (!isLocal()) {
      console.log("❌ Mock commands only available in local environment");
      return;
    }

    CognitoMockService.clearAllUsers();
    console.log("✅ All mock users cleared");
  },

  "mock:users:create": async (args: any) => {
    if (!isLocal()) {
      console.log("❌ Mock commands only available in local environment");
      return;
    }

    const email = args.email || "test@example.com";
    const password = args.password || "TestPass123!";
    
    CognitoMockService.createTestUser(email, password);
    console.log(`✅ Test user created: ${email} / ${password}`);
  },

  "mock:status": async () => {
    console.log("🧪 Mock Service Status:");
    console.log(`  Environment: ${process.env.NODE_ENV}`);
    console.log(`  Is Local: ${isLocal() ? '✅' : '❌'}`);
    console.log(`  DynamoDB: ${isLocal() ? '🐳 Docker Local' : '☁️ AWS'}`);
    console.log(`  Cognito: ${isLocal() ? '🧪 Mock Service' : '☁️ AWS'}`);
    
    if (isLocal()) {
      const users = CognitoMockService.getAllUsers();
      console.log(`  Mock Users: ${users.length}`);
    }
  },
};

export default mockCommands;