/**
 * Redis 工具 - 用于获取 Token
 * 复用主项目的 redis.ts 逻辑
 */
import { Redis } from 'ioredis';
export async function getFirstTokenFromRedis(config) {
    const redis = new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        db: config.db || 0,
        connectTimeout: 5000,
        commandTimeout: 5000,
    });
    try {
        // HIS 现场 Token 存在 key 名中：ONELINK:TOKEN:<jwt>
        const prefix = process.env.ZOE_REDIS_TOKEN_PREFIX || 'ONELINK:TOKEN:';
        const keys = await redis.keys(`${prefix}*`);
        if (keys.length > 0) {
            const key = keys[0];
            if (key.startsWith(prefix)) {
                return key.substring(prefix.length);
            }
        }
        // 兼容旧 key 模式
        const legacyPatterns = ['token:*', 'auth:*', 'user:token:*', 'login:token:*'];
        for (const pattern of legacyPatterns) {
            const legacyKeys = await redis.keys(pattern);
            if (legacyKeys.length > 0) {
                const value = await redis.get(legacyKeys[0]);
                if (value) {
                    try {
                        const parsed = JSON.parse(value);
                        return parsed.token || parsed.accessToken || parsed.access_token || value;
                    }
                    catch {
                        return value;
                    }
                }
            }
        }
        return null;
    }
    catch (error) {
        console.error('Redis error:', error);
        return null;
    }
    finally {
        await redis.quit();
    }
}
//# sourceMappingURL=redis.js.map