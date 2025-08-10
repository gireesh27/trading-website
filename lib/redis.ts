// lib/redis.ts
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL!; // example: redis://default:password@host:port

// Parse URL for explicit config (optional, but recommended)
const parsedUrl = new URL(redisUrl);

const redis = createClient({
  username: parsedUrl.username || undefined,
  password: parsedUrl.password,
  socket: {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port),
    // tls: parsedUrl.protocol === 'rediss:' ? {} : undefined, // Uncomment if using TLS
  },
});

redis.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redis.connect();
  console.log('Redis client connected');
})();

export default redis;
