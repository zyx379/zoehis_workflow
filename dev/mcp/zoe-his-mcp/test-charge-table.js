import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 先加载环境变量
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

async function findChargeTables() {
    console.log('🔍 查询门诊费用相关表...\n');
    
    // 查询所有以 CHA_OUTP 开头的表
    const tablesResult = await queryBusinessData({
        sql: "SELECT TABLE_NAME FROM USER_TABLES WHERE TABLE_NAME LIKE 'CHA_OUTP%'",
        description: '查询门诊收费相关表',
    });
    
    if (!tablesResult.success) {
        console.error('❌ 查询失败:', tablesResult.error);
        return;
    }
    
    console.log('📋 门诊收费相关表列表:');
    const tables = tablesResult.data.rows.map(row => row[0]);
    tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table}`);
    });
    
    // 如果找到表，查询第一个表的结构
    if (tables.length > 0) {
        console.log(`\n📊 查询表 ${tables[0]} 的结构:`);
        const schemaSql = `
            SELECT 
              c.COLUMN_NAME,
              c.DATA_TYPE,
              c.DATA_LENGTH,
              c.NULLABLE,
              c.DATA_DEFAULT,
              cc.COMMENTS
            FROM USER_TAB_COLUMNS c
            LEFT JOIN USER_COL_COMMENTS cc ON c.TABLE_NAME = cc.TABLE_NAME AND c.COLUMN_NAME = cc.COLUMN_NAME
            WHERE c.TABLE_NAME = '${tables[0]}'
            ORDER BY c.COLUMN_ID
        `;
        
        const schemaResult = await queryBusinessData({
            sql: schemaSql,
            description: `查询表 ${tables[0]} 的结构`,
        });
        
        if (!schemaResult.success) {
            console.error('❌ 查询表结构失败:', schemaResult.error);
            return;
        }
        
        console.log('\n字段列表:');
        console.log('┌─────────────────────────┬─────────────┬───────────┬──────────┬─────────────────────────────────────┐');
        console.log('│ COLUMN_NAME            │ DATA_TYPE   │ LENGTH    │ NULLABLE │ COMMENTS                           │');
        console.log('├─────────────────────────┼─────────────┼───────────┼──────────┼─────────────────────────────────────┤');
        
        schemaResult.data.rows.forEach(row => {
            const colName = row[0]?.padEnd(23) || ''.padEnd(23);
            const dataType = row[1]?.padEnd(11) || ''.padEnd(11);
            const length = (row[2]?.toString() || '').padEnd(9);
            const nullable = row[3]?.padEnd(8) || ''.padEnd(8);
            const comments = (row[5] || '').substring(0, 43).padEnd(43);
            
            console.log(`│ ${colName}│ ${dataType}│ ${length}│ ${nullable}│ ${comments}│`);
        });
        
        console.log('└─────────────────────────┴─────────────┴───────────┴──────────┴─────────────────────────────────────┘');
    }
}

findChargeTables().catch(console.error);
