import CONFIG from "@/config";
import redis from "@/redis";
import { RedisClientType } from "redis";

export type SessionServiceMethodParams = { userId: string; token: string };

export class SessionService {
  private appname: string;
  constructor(private redisClient: RedisClientType) {
    this.appname = CONFIG.app_name;
  }
  private activeTokensKey(userId: string) {
    return `${this.appname}:tokens:${userId}`;
  }
  public async addToken({ token, userId }: SessionServiceMethodParams) {
    const activeTokensKey = this.activeTokensKey(userId);
    await this.redisClient.SADD(activeTokensKey, token);
    await this.redisClient.set(token, "1", { PX: CONFIG.jwt_expires_in_ms });
  }
  public async verifyToken({
    token,
    userId,
  }: SessionServiceMethodParams): Promise<boolean> {
    const activeTokensKey = this.activeTokensKey(userId);
    const tokenExists = await this.redisClient.get(token);
    const isInTokens = await this.redisClient.SISMEMBER(activeTokensKey, token);
    if (!tokenExists) {
      if (isInTokens) {
        await this.redisClient.SREM(activeTokensKey, token);
      }
      return false;
    } else {
      if (!isInTokens) {
        await this.redisClient.del(token);
        return false;
      } else {
        return true;
      }
    }
  }
  public async blacklistToken({ token, userId }: SessionServiceMethodParams) {
    const activeTokensKey = this.activeTokensKey(userId);
    await this.redisClient.SREM(activeTokensKey, token);
    await this.redisClient.del(token);
  }
}

const sessionService = new SessionService(redis);

export default sessionService;
