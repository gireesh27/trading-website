import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
const parsedUrl = new URL(redisUrl || "redis://localhost:6379");

const redis = createClient({
  username: parsedUrl.username || undefined,
  password: parsedUrl.password || undefined,
  socket: {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port || 6379),
  },
});

redis.on("error", (err) => console.error("Redis Client Error", err));

if (redisUrl) {
  redis.connect().catch((err) => {
    console.error("Redis connection error", err);
  });
}

export default redis;
