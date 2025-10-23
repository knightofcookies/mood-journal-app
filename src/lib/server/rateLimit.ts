import { env } from '$env/dynamic/private';

// Simple in-memory fallback
const ipMap = new Map<string, { count: number; expiresAt: number }>();

let redisClient: {
	incr: (key: string) => Promise<number>;
	expire: (key: string, ttl: number) => Promise<number>;
	del: (key: string) => Promise<number>;
} | null = null;
try {
	if (env.REDIS_URL) {
		// lazily require to avoid adding a hard dependency for dev users
		// ioredis has wide compatibility
		const IORedis = require('ioredis');
		redisClient = new IORedis(env.REDIS_URL);
	}
} catch {
	// if redis isn't installed or connection fails, we'll fall back to in-memory
	redisClient = null;
}

async function allowRedis(ip: string, limit: number, windowMs: number) {
	if (!redisClient) return true; // fallback to allow if redis not available
	const key = `rl:${ip}`;
	const ttlSec = Math.ceil(windowMs / 1000);
	// INCR and set EXPIRE if new
	const count = await redisClient.incr(key);
	if (count === 1) {
		await redisClient.expire(key, ttlSec);
	}
	return count <= limit;
}

function allowMemory(ip: string, limit = 50, windowMs = 60_000) {
	const now = Date.now();
	const entry = ipMap.get(ip);
	if (!entry || entry.expiresAt <= now) {
		ipMap.set(ip, { count: 1, expiresAt: now + windowMs });
		return true;
	}

	if (entry.count >= limit) return false;
	entry.count += 1;
	return true;
}

export async function allow(ip: string, limit = 50, windowMs = 60_000) {
	if (redisClient) {
		try {
			return await allowRedis(ip, limit, windowMs);
		} catch (e) {
			// fall back to memory on any redis error
			return allowMemory(ip, limit, windowMs);
		}
	}
	return allowMemory(ip, limit, windowMs);
}

export async function reset(ip: string) {
	if (redisClient) {
		try {
			await redisClient.del(`rl:${ip}`);
			return;
		} catch (e) {
			// fall through to memory fallback
		}
	}
	ipMap.delete(ip);
}
