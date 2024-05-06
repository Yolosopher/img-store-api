import { Role } from "@/global";
import ForbiddenError from "@errors/ForbiddenError";
import { NextFunction, Request, Response } from "express";

const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // check current user
  if (!req.current_user) {
    return next(
      new ForbiddenError({
        message: "You must be logged in to have access",
      })
    );
  }

  // check if user is admin
  if (req.current_user.role === Role.USER) {
    return next(
      new ForbiddenError({
        message: "You must be an admin to have access",
      })
    );
  }

  next();
};

export default requireAdmin;
