import ForbiddenError from "@/errors/ForbiddenError";
import { NextFunction, Request, Response } from "express";

const requireSelf = async (req: Request, res: Response, next: NextFunction) => {
  // check current user
  if (!req.current_user) {
    return next(
      new ForbiddenError({
        message: "You must be logged in to access this resource",
      })
    );
  }

  // check if user is self
  if (req.current_user._id !== req.params.target_user_id) {
    return next(
      new ForbiddenError({
        message: "You cant do this action to another user",
      })
    );
  }

  next();
};

export default requireSelf;
