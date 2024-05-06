import { NextFunction, Request, Response } from "express";
import z, { ZodError } from "zod";

type DataFromEnum = "body" | "params" | "query";

const validateZod = <T>(
  schema: z.Schema<T>,
  dataFrom: DataFromEnum = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const zodResult = schema.safeParse(req[dataFrom]);
    if (!zodResult.success) {
      return next(new ZodError(zodResult.error.issues));
    }
    next();
  };
};

export default validateZod;
