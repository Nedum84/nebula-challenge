import express from "express";
import { validateReq, authMiddleware, optionalAuthMiddleware } from "../middlewares";
import { leaderboardValidation } from "../validation/leaderboard.validation";
import { leaderboardController } from "../controller/leaderboard.controller";

const router = express.Router({ mergeParams: true });

// Score submission - requires authentication
router.post("/submit", 
  authMiddleware, 
  validateReq(leaderboardValidation.submitScore), 
  leaderboardController.submitScore
);

// Get full leaderboard - public endpoint
router.get("/", 
  validateReq(leaderboardValidation.getLeaderboard), 
  leaderboardController.getLeaderboard
);

// Get top 1 score - public endpoint (as requested in challenge)
router.get("/top", 
  leaderboardController.getTopScore
);

// Get user's scores - requires authentication
router.get("/user/scores", 
  authMiddleware, 
  leaderboardController.getUserScores
);

// Get user's best score - requires authentication
router.get("/user/best", 
  authMiddleware, 
  leaderboardController.getUserBestScore
);

export const leaderboardRoutes = router;