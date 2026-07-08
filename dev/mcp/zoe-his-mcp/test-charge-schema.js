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

async function listChargeTables() {
    console.log('🔍 查询 ZOECHARGE schema 中的表...\n');
    
    // 查询 ZOECHARGE schema 的所有表
    const tablesResult = await queryBusinessData({
        sql: "SELECT TABLE_NAME FROM ALL_TABLES WHERE OWNER = 'ZOECHARGE' ORDER BY TABLE_NAME",
        description: '查询 ZOECHARGE schema 的所有表',
    });
    
    if (!tablesResult.success) {
        console.error('❌ 查询失败:', tablesResult.error);
        return;
    }
    
    console.log(`📋 ZOECHARGE schema 中共有 ${tablesResult.data.rowCount} 个表:`);
    const tables = tablesResult.data.rows.map(row => row[0]);
    tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table}`);
    });
    
    // 查询门诊收费明细表的结构
    const targetTable = 'CHA_OUTP_CHARGE_DETAIL';
    if (tables.includes(targetTable)) {
        console.log(`\n📋 查询表 ${targetTable} 的结构:`);
        
        // 简化为单行 SQL
        const schemaSql = `SELECT c.COLUMN_NAME, c.DATA_TYPE, c.DATA_LENGTH, c.NULLABLE, cc.COMMENTS FROM ALL_TAB_COLUMNS c LEFT JOIN ALL_COL_COMMENTS cc ON c.TABLE_NAME = cc.TABLE_NAME AND c.COLUMN_NAME = cc.COLUMN_NAME WHERE c.OWNER = 'ZOECHARGE' AND c.TABLE_NAME = '${targetTable}' ORDER BY c.COLUMN_ID`;
        
        const schemaResult = await queryBusinessData({
            sql: schemaSql,
            description: `查询表 ${targetTable} 的结构`,
        });
        
        if (!schemaResult.success) {
            console.error('❌ 查询表结构失败:', schemaResult.error);
            return;
        }
        
        console.log('\n字段列表:');
        console.log('┌──────────────────────────────┬──────────────┬──────────┬──────────┬──────────────────────────────────────┐');
        console.log('│ COLUMN_NAME                 │ DATA_TYPE    │ LENGTH   │ NULLABLE │ COMMENTS                             │');
        console.log('├──────────────────────────────┼──────────────┼──────────┼──────────┼──────────────────────────────────────┤');
        
        schemaResult.data.rows.forEach(row => {
            const colName = row[0]?.padEnd(28) || ''.padEnd(28);
            const dataType = row[1]?.padEnd(12) || ''.padEnd(12);
            const length = (row[2]?.toString() || '').padEnd(8);
            const nullable = row[3]?.padEnd(8) || ''.padEnd(8);
            const comments = (row[4] || '').substring(0, 44).padEnd(44);
            
            console.log(`│ ${colName}│ ${dataType}│ ${length}│ ${nullable}│ ${comments}│`);
        });
        
        console.log('└──────────────────────────────┴──────────────┴──────────┴──────────┴──────────────────────────────────────┘');
    } else {
        console.log(`\n⚠️ 未找到表 ${targetTable}`);
    }
}

listChargeTables().catch(console.error);
