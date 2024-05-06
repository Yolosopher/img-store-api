import ForbiddenError from "@/errors/ForbiddenError";
import UnauthorizedError from "@/errors/UnauthorizedError";
import userService from "@/services/user";
import { NextFunction, Request, Response } from "express";

const requireApiToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.api_token) {
    return next(
      new ForbiddenError({
        message: "You must be logged in to have access",
      })
    );
  }
  next();
};

export default requireApiToken;
