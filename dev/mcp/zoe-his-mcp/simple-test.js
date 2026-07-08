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

// 简单查询用户表
async function simpleQuery() {
  try {
    console.log('查询用户表列表...');
    
    const result = await queryBusinessData({
      sql: "SELECT TABLE_NAME FROM USER_TABLES WHERE ROWNUM <= 30 ORDER BY TABLE_NAME",
      description: '查询用户表列表'
    });
    
    if (result.success) {
      console.log(`\n找到 ${result.data.rows.length} 张表:`);
      result.data.rows.forEach(row => {
        console.log(`  - ${row[0]}`);
      });
    } else {
      console.log(`查询失败: ${result.error}`);
    }
  } catch (error) {
    console.error('发生异常:', error);
  }
}

simpleQuery();
