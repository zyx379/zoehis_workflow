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

async function listAllTables() {
    console.log('🔍 查询数据库中所有表...\n');
    
    // 查询所有用户表
    const tablesResult = await queryBusinessData({
        sql: "SELECT TABLE_NAME FROM USER_TABLES ORDER BY TABLE_NAME",
        description: '查询所有用户表',
    });
    
    if (!tablesResult.success) {
        console.error('❌ 查询失败:', tablesResult.error);
        return;
    }
    
    console.log(`📋 数据库中共 ${tablesResult.data.rowCount} 个用户表:`);
    const tables = tablesResult.data.rows.map(row => row[0]);
    tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table}`);
    });
}

listAllTables().catch(console.error);
