import ForbiddenError from "@/errors/ForbiddenError";
import { NextFunction, Request, Response } from "express";

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  // check current user
  if (!req.current_user) {
    return next(
      new ForbiddenError({
        message: "You must be logged in to have access",
      })
    );
  }

  next();
};

export default requireAuth;
