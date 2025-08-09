import express from "express";
import { validateReq, authMiddleware, optionalAuthMiddleware } from "../middlewares";
import { leaderboardValidation } from "../validation/leaderboard.validation";
import { leaderboardController } from "../controller/leaderboard.controller";

const router = express.Router({ mergeParams: true });

router.post("/submit", 
  authMiddleware, 
  validateReq(leaderboardValidation.submitScore), 
  leaderboardController.submitScore
);

router.get("/", 
  validateReq(leaderboardValidation.getLeaderboard), 
  leaderboardController.getLeaderboard
);

router.get("/top", 
  leaderboardController.getTopScore
);

router.get("/user/scores", 
  authMiddleware, 
  leaderboardController.getUserScores
);

router.get("/user/best", 
  authMiddleware, 
  leaderboardController.getUserBestScore
);

export const leaderboardRoutes = router;