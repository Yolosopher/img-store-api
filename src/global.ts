import { IncomingMessage, Server, ServerResponse } from "http";
import { Schema } from "mongoose";

export type NODE_ENV_TYPE = "development" | "production" | "test";
export type AppConfig = {
  port: number | string;
  mode: NODE_ENV_TYPE;
  mongo_url: string;
};
export enum Role {
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
  USER = "user",
}
export type TID = Schema.Types.ObjectId | string;
export type ServerInstanceType = Server<
  typeof IncomingMessage,
  typeof ServerResponse
>;
export interface JWT_PAYLOAD {
  _id: string;
  email: string;
  full_name: string;
  role: Role;
}

export interface ICurrentUser extends JWT_PAYLOAD {
  auth_token: string;
}
