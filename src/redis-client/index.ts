import { RedisClientType, createClient } from "redis";

const redisClient: RedisClientType = createClient();

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export default redisClient;
