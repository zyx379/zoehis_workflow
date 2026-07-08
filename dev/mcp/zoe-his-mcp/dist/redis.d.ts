/**
 * Redis 工具 - 用于获取 Token
 * 复用主项目的 redis.ts 逻辑
 */
import { RedisConfig } from './types.js';
export declare function getFirstTokenFromRedis(config: RedisConfig): Promise<string | null>;
//# sourceMappingURL=redis.d.ts.map