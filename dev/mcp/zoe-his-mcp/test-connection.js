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
    console.log('✅ 已加载环境变量');
  }
}

loadEnvFile();

import { queryBusinessData } from './dist/tools/query-business-data.js';

// 测试数据库连接
async function testDbConnection() {
  console.log('\n🔍 测试数据库连接...');
  
  // 查询 DUAL 表验证连接
  console.log('\n1️⃣ 测试基础连接（查询 DUAL）...');
  const dualResult = await queryBusinessData({
    sql: "SELECT SYSDATE FROM DUAL",
    description: '测试数据库连接'
  });
  
  if (dualResult.success) {
    console.log(`✅ 数据库连接成功！当前时间: ${dualResult.data.rows[0][0]}`);
  } else {
    console.log(`❌ 数据库连接失败: ${dualResult.error}`);
    return;
  }
  
  // 查询当前用户
  console.log('\n2️⃣ 查询当前用户...');
  const userResult = await queryBusinessData({
    sql: "SELECT USER FROM DUAL",
    description: '查询当前用户'
  });
  
  if (userResult.success) {
    console.log(`✅ 当前用户: ${userResult.data.rows[0][0]}`);
  }
  
  // 查询数据库版本
  console.log('\n3️⃣ 查询数据库版本...');
  const versionResult = await queryBusinessData({
    sql: "SELECT BANNER FROM V$VERSION WHERE ROWNUM <= 1",
    description: '查询数据库版本'
  });
  
  if (versionResult.success && versionResult.data.rows.length > 0) {
    console.log(`✅ 数据库版本: ${versionResult.data.rows[0][0]}`);
  }
  
  // 查询表数量
  console.log('\n4️⃣ 查询用户表数量...');
  const tableCountResult = await queryBusinessData({
    sql: "SELECT COUNT(*) FROM USER_TABLES",
    description: '查询用户表数量'
  });
  
  if (tableCountResult.success) {
    console.log(`✅ 用户表数量: ${tableCountResult.data.rows[0][0]}`);
  }
  
  console.log('\n🎉 MCP 工具测试完成！数据库连接正常！');
}

testDbConnection().catch(console.error);
