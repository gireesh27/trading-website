// lib/redis.ts
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL!;

const parsedUrl = new URL(redisUrl);

const redis = createClient({
  username: parsedUrl.username || undefined,
  password: parsedUrl.password,
  socket: {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port),

  },
});

redis.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redis.connect();
  console.log('Redis client connected');
})();

export default redis;
