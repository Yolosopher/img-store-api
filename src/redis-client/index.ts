import CONFIG from "@/config";
import { RedisClientType, createClient } from "redis";

const redisClient: RedisClientType = createClient({
  name: CONFIG.app_name,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export default redisClient;
