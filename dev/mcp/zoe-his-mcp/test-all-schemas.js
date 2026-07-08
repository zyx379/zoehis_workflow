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

async function listAllSchemas() {
    console.log('🔍 查询所有 schema 及其表...\n');
    
    // 查询所有 schema
    const schemaResult = await queryBusinessData({
        sql: "SELECT USERNAME FROM ALL_USERS ORDER BY USERNAME",
        description: '查询所有 schema',
    });
    
    if (!schemaResult.success) {
        console.error('❌ 查询失败:', schemaResult.error);
        return;
    }
    
    console.log('📋 数据库中的 schema 列表:');
    const schemas = schemaResult.data.rows.map(row => row[0]);
    schemas.forEach((schema, index) => {
        console.log(`  ${index + 1}. ${schema}`);
    });
    
    // 查询每个 schema 的表数量
    console.log('\n📊 各 schema 的表数量:');
    for (const schema of schemas.slice(0, 20)) { // 只显示前 20 个
        const countResult = await queryBusinessData({
            sql: `SELECT COUNT(*) FROM ALL_TABLES WHERE OWNER = '${schema}'`,
            description: `查询 ${schema} 的表数量`,
        });
        
        if (countResult.success) {
            const count = countResult.data.rows[0][0];
            if (count > 0) {
                console.log(`  ${schema}: ${count} 个表`);
            }
        }
    }
}

listAllSchemas().catch(console.error);
