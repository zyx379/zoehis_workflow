import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 手动加载 .env 文件
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
    console.log('已加载环境变量');
  }
}

loadEnvFile();

import { queryBusinessData } from './dist/tools/query-business-data.js';

// 测试查询门诊费用明细表
async function test() {
  console.log('正在查询门诊费用明细表结构...');
  
  // 先查询所有以 CHARGE 或 FEE 或 BILL 开头的表（从 ALL_TABLES）
  console.log('\n📋 查询费用相关表（ALL_TABLES）...');
  const tablesResult = await queryBusinessData({
    sql: `SELECT TABLE_NAME FROM ALL_TABLES WHERE (TABLE_NAME LIKE 'OUTP%' OR TABLE_NAME LIKE '%CHARGE%' OR TABLE_NAME LIKE '%FEE%') ORDER BY TABLE_NAME`,
    description: '查询费用相关表'
  });
  
  if (tablesResult.success && tablesResult.data.rows.length > 0) {
    console.log('找到的费用相关表：');
    tablesResult.data.rows.forEach(row => console.log(`  - ${row[0]}`));
  } else {
    console.log('未找到费用相关表');
  }
  
  // 查询当前用户
  console.log('\n👤 查询当前用户...');
  const userResult = await queryBusinessData({
    sql: "SELECT USER FROM DUAL",
    description: '查询当前用户'
  });
  
  if (userResult.success && userResult.data.rows.length > 0) {
    console.log(`当前用户: ${userResult.data.rows[0][0]}`);
  }
  
  // 查询所有表（前20个）
  console.log('\n📊 查询所有表（前20个）...');
  const allTablesResult = await queryBusinessData({
    sql: `SELECT TABLE_NAME FROM ALL_TABLES WHERE ROWNUM <= 20 ORDER BY TABLE_NAME`,
    description: '查询所有表'
  });
  
  if (allTablesResult.success && allTablesResult.data.rows.length > 0) {
    console.log('所有表（前20个）：');
    allTablesResult.data.rows.forEach(row => console.log(`  - ${row[0]}`));
  }
}

test().catch(console.error);
