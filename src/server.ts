import App from "./app";
import CONFIG from "./config";
import { ICurrentUser } from "./global";

declare global {
  namespace Express {
    interface Request {
      current_user?: ICurrentUser;
      api_token?: {
        user_id: string;
        token: string;
      };
    }
  }
}
new App({
  port: CONFIG.port,
  mode: CONFIG.node_env,
  mongo_url: CONFIG.mongo_url,
}).runServer();
