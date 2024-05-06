import { Request, Response, NextFunction } from "express";

// Define a middleware function that handles asynchronous operations
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => any | Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Wrap the async function in a Promise to catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
