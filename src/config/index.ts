import { NODE_ENV_TYPE } from "@/global";
import "dotenv/config";
import path from "path";

export const parseTimeSpanToMilliseconds = (timeSpan: string): number => {
  const matches = timeSpan.match(/^(\d+)([smhd])$/);
  if (!matches) {
    throw new Error("Invalid time span format");
  }

  const value = parseInt(matches[1]);
  const unit = matches[2];

  let multiplier: number;
  switch (unit) {
    case "s":
      multiplier = 1000; // seconds to milliseconds
      break;
    case "m":
      multiplier = 1000 * 60; // minutes to milliseconds
      break;
    case "h":
      multiplier = 1000 * 60 * 60; // hours to milliseconds
      break;
    case "d":
      multiplier = 1000 * 60 * 60 * 24; // days to milliseconds
      break;
    default:
      throw new Error("Invalid time unit");
  }

  return value * multiplier;
};

const expiresIn = process.env.JWT_EXPIRES_IN || "30d";
const CONFIG = {
  mongo_url: process.env.MONGO_URL || "mongodb://localhost:27017",
  port: process.env.PORT || 3000,
  secret_key: process.env.SECRET_KEY || "secret-key",
  jwt_expires_in: expiresIn,
  jwt_expires_in_ms: parseTimeSpanToMilliseconds(expiresIn),
  app_name: process.env.APP_NAME || "app-name",
  node_env: process.env.NODE_ENV! as NODE_ENV_TYPE,

  default_super_admin: {
    email: process.env.DEFAULT_SUPER_ADMIN_EMAIL!,
    password: process.env.DEFAULT_SUPER_ADMIN_PASSWORD!,
  },

  image_upload_path: path.resolve(process.env.IMAGE_UPLOAD_PATH! || "uploads"),
};

export default CONFIG;
