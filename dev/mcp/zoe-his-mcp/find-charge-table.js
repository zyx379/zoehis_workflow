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
import { getTableSchema } from './dist/tools/get-table-schema.js';

// 查询门诊费用明细表
async function findOutpChargeTable() {
  console.log('🔍 查询门诊费用明细表...\n');
  
  // 查询所有可能的门诊费用表
  const result = await queryBusinessData({
    sql: `SELECT TABLE_NAME FROM USER_TABLES WHERE 
           TABLE_NAME LIKE 'OUTP%' OR 
           TABLE_NAME LIKE '%CHARGE%' OR 
           TABLE_NAME LIKE '%FEE%' OR
           TABLE_NAME LIKE '%BILL%'
           ORDER BY TABLE_NAME`,
    description: '查询费用相关表'
  });
  
  if (!result.success) {
    console.log('❌ 查询失败:', result.error);
    return;
  }
  
  const chargeTables = result.data.rows.map(row => row[0]);
  
  if (chargeTables.length === 0) {
    console.log('❌ 未找到门诊费用相关表');
    return;
  }
  
  console.log(`找到 ${chargeTables.length} 张费用相关表:`);
  chargeTables.forEach(table => console.log(`  - ${table}`));
  
  // 查询每个表的结构
  for (const tableName of chargeTables) {
    console.log(`\n📋 查询 ${tableName} 的结构:`);
    const schemaResult = await getTableSchema({ tableNamePattern: tableName });
    
    if (schemaResult.success && schemaResult.data.schema.rowCount > 0) {
      const schema = schemaResult.data.schema;
      console.log('='.repeat(75));
      console.log(`| ${'字段名'.padEnd(22)} | ${'类型'.padEnd(14)} | ${'长度'.padEnd(6)} | ${'可空'.padEnd(4)} | ${'注释'}`);
      console.log('='.repeat(75));
      schema.rows.forEach(row => {
        console.log(`| ${row[0]?.padEnd(22)} | ${row[1]?.padEnd(14)} | ${String(row[2] || '').padEnd(6)} | ${row[3]?.padEnd(4)} | ${row[5] || '-'}`);
      });
      console.log('='.repeat(75));
    } else {
      console.log(`❌ 无法获取表结构: ${schemaResult.error || '空表'}`);
    }
  }
}

findOutpChargeTable();
