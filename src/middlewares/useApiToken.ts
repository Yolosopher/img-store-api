import UnauthorizedError from "@/errors/UnauthorizedError";
import userService from "@/services/user";
import { NextFunction, Request, Response } from "express";

const useApiToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }
  try {
    const token = authHeader.split(" ")[1];

    const verifyApiToken = await userService.verifyApiToken(token);
    if (!verifyApiToken.success) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.api_token = {
      user_id: verifyApiToken.user_id!,
      token,
    };
    return next();
  } catch (error) {
    return next(new UnauthorizedError({ message: "Invalid token" }));
  }
};

export default useApiToken;
