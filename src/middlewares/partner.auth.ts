import { Request, Response, NextFunction } from "express";

export const partnerAuth = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement partner auth middleware
  next();
};

export const requireAuthPartner = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement require auth partner middleware
  next();
};
