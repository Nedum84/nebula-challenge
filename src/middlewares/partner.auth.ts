import { Request, Response, NextFunction } from "express";

export const partnerAuth = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement partner auth middleware
  next();
};

