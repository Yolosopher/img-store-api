import UnauthorizedError from "@/errors/UnauthorizedError";
import jwtInstance from "@/utils/jwt";
import { NextFunction, Request, Response } from "express";

const currentUser = async (req: Request, res: Response, next: NextFunction) => {
  // check bearer token
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return next();
    }

    // verify token
    const result = await jwtInstance.verify(token);
    if (result.success === false) {
      return next(
        new UnauthorizedError({
          message: result.message,
        })
      );
    } else {
      req.current_user = { ...result.payload, auth_token: token };
      return next();
    }
  } catch (error: any) {
    return next(
      new UnauthorizedError({
        message: error.message,
      })
    );
  }
};

export default currentUser;
