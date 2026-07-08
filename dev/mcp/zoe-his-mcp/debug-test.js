import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function loadEnvFile() {
  const envPath = join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, value] = trimmed.split('=', 2);
        if (key && value !== undefined && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile();

import { queryBusinessData } from './dist/tools/query-business-data.js';

// 详细测试
async function debugQuery() {
  console.log('=== 调试数据库查询 ===\n');
  
  // 测试1: 查询 DUAL
  console.log('测试1: SELECT SYSDATE FROM DUAL');
  try {
    const result = await queryBusinessData({
      sql: "SELECT SYSDATE FROM DUAL",
      description: '测试'
    });
    console.log('结果:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.log('异常:', e.message);
  }
  
  // 测试2: 查询用户表数量
  console.log('\n测试2: SELECT COUNT(*) FROM USER_TABLES');
  try {
    const result = await queryBusinessData({
      sql: "SELECT COUNT(*) FROM USER_TABLES",
      description: '查询表数量'
    });
    console.log('结果:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.log('异常:', e.message);
  }
  
  // 测试3: 查询表名（不加额外限制）
  console.log('\n测试3: SELECT TABLE_NAME FROM USER_TABLES');
  try {
    const result = await queryBusinessData({
      sql: "SELECT TABLE_NAME FROM USER_TABLES",
      description: '查询表名'
    });
    console.log('成功:', result.success);
    console.log('行数:', result.data?.rowCount || 0);
    if (result.data?.rows?.length > 0) {
      console.log('前5个表:', result.data.rows.slice(0, 5).map(r => r[0]));
    }
  } catch (e) {
    console.log('异常:', e.message);
  }
}

debugQuery();
