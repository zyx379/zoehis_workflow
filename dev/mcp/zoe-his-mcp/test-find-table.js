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

// 查询所有用户表并找到门诊费用明细表
async function findOutpChargeTable() {
  console.log('📋 查询所有用户表...');
  
  // 查询所有用户表
  const tablesResult = await queryBusinessData({
    sql: "SELECT TABLE_NAME FROM USER_TABLES ORDER BY TABLE_NAME",
    description: '查询所有用户表'
  });
  
  if (!tablesResult.success || tablesResult.data.rows.length === 0) {
    console.log('❌ 未找到用户表');
    return;
  }
  
  console.log(`\n找到 ${tablesResult.data.rows.length} 张用户表`);
  
  // 筛选门诊相关表
  const outpTables = tablesResult.data.rows
    .map(row => row[0])
    .filter(name => name.includes('OUTP') || name.includes('CHARGE') || name.includes('FEE') || name.includes('BILL'));
  
  console.log('\n💰 费用相关表：');
  outpTables.forEach(table => console.log(`  - ${table}`));
  
  // 如果找到了门诊费用相关表，查询第一个的结构
  if (outpTables.length > 0) {
    console.log(`\n🔍 查询 ${outpTables[0]} 的表结构...`);
    const schemaResult = await getTableSchema({ tableNamePattern: outpTables[0] });
    
    if (schemaResult.success && schemaResult.data.schema.rowCount > 0) {
      const schema = schemaResult.data.schema;
      console.log(`\n✅ ${outpTables[0]} 表结构:`);
      console.log('='.repeat(70));
      console.log(`| ${'字段名'.padEnd(22)} | ${'类型'.padEnd(14)} | ${'长度'.padEnd(6)} | ${'可空'.padEnd(4)} | ${'注释'}`);
      console.log('='.repeat(70));
      schema.rows.forEach(row => {
        console.log(`| ${row[0]?.padEnd(22)} | ${row[1]?.padEnd(14)} | ${String(row[2] || '').padEnd(6)} | ${row[3]?.padEnd(4)} | ${row[5] || '-'}`);
      });
      console.log('='.repeat(70));
    } else {
      console.log(`❌ 无法查询表结构: ${schemaResult.error || '无数据'}`);
    }
  }
}

findOutpChargeTable().catch(console.error);
