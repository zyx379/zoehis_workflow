/**
 * 测试 nasyy 环境：Redis Token、日志 API、Oracle 库
 * 用法: node scripts/test-nasyy-connection.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Redis } from 'ioredis';

function loadEnvFile() {
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, value] = trimmed.split('=', 2);
      if (key && value !== undefined && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

function projectEnv(code, key) {
  return process.env[`ZOE_${code}_${key}`] || process.env[`ZOE_DB_${code}_${key}`];
}

loadEnvFile();

const code = process.env.ZOE_PROJECT_CODE || 'nasyy';
const results = [];

function ok(name, detail) {
  results.push({ name, status: 'OK', detail });
  console.log(`✅ ${name}: ${detail}`);
}

function fail(name, detail) {
  results.push({ name, status: 'FAIL', detail });
  console.log(`❌ ${name}: ${detail}`);
}

async function testRedis() {
  const host = projectEnv(code, 'REDIS_HOST');
  const port = parseInt(projectEnv(code, 'REDIS_PORT') || '6379', 10);
  const password = projectEnv(code, 'REDIS_PASSWORD');
  const db = parseInt(projectEnv(code, 'REDIS_DB') || '0', 10);
  const redis = new Redis({ host, port, password, db, connectTimeout: 8000, commandTimeout: 8000 });
  try {
    const pong = await redis.ping();
    const prefix = process.env.ZOE_REDIS_TOKEN_PREFIX || 'ONELINK:TOKEN:';
    const tokenKeys = await redis.keys(`${prefix}*`);
    ok('Redis', `PING=${pong}, ${prefix}* keys=${tokenKeys.length}`);
  } catch (e) {
    fail('Redis', e.message);
  } finally {
    await redis.quit().catch(() => {});
  }
}

async function testLogApi() {
  const baseUrl = projectEnv(code, 'API_BASE_URL');
  const logPath = projectEnv(code, 'API_LOG_PATH') || process.env.ZOE_API_LOG_PATH || '/log/search';
  const url = `${baseUrl}${logPath}`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageSize: '1', pageNum: '1', traceId: '__connection_test__' }),
      signal: AbortSignal.timeout(15000),
    });
    const text = await resp.text().catch(() => '');
    if (resp.ok || resp.status === 401 || resp.status === 403) {
      ok('日志 API', `HTTP ${resp.status} ${url} (可达，鉴权需 Redis Token)`);
    } else {
      fail('日志 API', `HTTP ${resp.status} ${text.slice(0, 120)}`);
    }
  } catch (e) {
    fail('日志 API', `${url} — ${e.message}`);
  }
}

async function testOracle() {
  const host = projectEnv(code, 'HOST');
  const port = projectEnv(code, 'PORT');
  const username = projectEnv(code, 'USERNAME');
  const password = projectEnv(code, 'PASSWORD');
  const serviceName = projectEnv(code, 'SERVICE_NAME');
  const oracledb = (await import('oracledb')).default || (await import('oracledb'));
  const connectString = `${host}:${port}/${serviceName}`;
  let conn;
  try {
    conn = await oracledb.getConnection({ user: username, password, connectString });
    const r = await conn.execute('SELECT 1 AS C FROM DUAL', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    ok('Oracle', `DUAL => ${JSON.stringify(r.rows?.[0])} (${connectString})`);
  } catch (e) {
    fail('Oracle', `${connectString} — ${e.message}`);
  } finally {
    if (conn) await conn.close().catch(() => {});
  }
}

async function testGitLab() {
  const token = process.env.GITLAB_TOKEN;
  const baseUrl = process.env.GITLAB_BASE_URL || 'http://gitlab.zoesoft.com.cn';
  if (!token) {
    fail('GitLab', '未配置 GITLAB_TOKEN（get_code 需要）');
    return;
  }
  try {
    const resp = await fetch(`${baseUrl}/api/v4/user?private_token=${token}`, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      const user = await resp.json();
      ok('GitLab', `已认证: ${user.username || user.name}`);
    } else {
      fail('GitLab', `HTTP ${resp.status}`);
    }
  } catch (e) {
    fail('GitLab', e.message);
  }
}

console.log(`\n=== 连接测试 [${code}] ===\n`);
await testRedis();
await testLogApi();
await testOracle();
await testGitLab();

const failed = results.filter((r) => r.status === 'FAIL').length;
console.log(`\n=== 汇总: ${results.length - failed}/${results.length} 通过 ===\n`);
process.exit(failed > 0 ? 1 : 0);
