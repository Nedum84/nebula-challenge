import Joi from "joi";

const submitScore = {
  body: Joi.object()
    .keys({
      score: Joi.number().integer().min(0).max(999999).required(),
    })
    .required(),
};

const getLeaderboard = {
  query: Joi.object()
    .keys({
      limit: Joi.number().integer().min(1).max(100).optional().default(10),
    })
    .optional(),
};

export const leaderboardValidation = {
  submitScore,
  getLeaderboard,
};