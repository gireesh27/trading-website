import Redis from "ioredis";

// Default: localhost:6379 which WSL exposes
const redis = new Redis();

export default redis;
