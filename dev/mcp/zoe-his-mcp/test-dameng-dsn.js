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

// 使用 DSN 测试达梦数据库连接
async function testDamengConnection() {
  console.log('🔍 测试达梦数据库连接（使用 DSN）...');
  
  try {
    // 测试1: 查询数据库版本
    console.log('\n1️⃣ 查询数据库版本...');
    const versionResult = await queryBusinessData({
      sql: "SELECT * FROM V$VERSION",
      description: '查询达梦数据库版本'
    });
    
    if (versionResult.success) {
      console.log('✅ 达梦数据库连接成功！');
      console.log('数据库版本信息:');
      versionResult.data.rows.forEach(row => {
        console.log(`  - ${row.join(' | ')}`);
      });
    } else {
      console.log(`❌ 连接失败: ${versionResult.error}`);
      return;
    }
    
    // 测试2: 查询当前用户
    console.log('\n2️⃣ 查询当前用户...');
    const userResult = await queryBusinessData({
      sql: "SELECT USER FROM DUAL",
      description: '查询当前用户'
    });
    
    if (userResult.success) {
      console.log(`✅ 当前用户: ${userResult.data.rows[0][0]}`);
    }
    
    // 测试3: 查询表数量
    console.log('\n3️⃣ 查询用户表数量...');
    const tableCountResult = await queryBusinessData({
      sql: "SELECT COUNT(*) FROM USER_TABLES",
      description: '查询用户表数量'
    });
    
    if (tableCountResult.success) {
      console.log(`✅ 用户表数量: ${tableCountResult.data.rows[0][0]}`);
    }
    
    // 测试4: 查询前10个表名
    console.log('\n4️⃣ 查询前10个表名...');
    const tablesResult = await queryBusinessData({
      sql: "SELECT TABLE_NAME FROM USER_TABLES WHERE ROWNUM <= 10 ORDER BY TABLE_NAME",
      description: '查询前10个表名'
    });
    
    if (tablesResult.success) {
      console.log('✅ 前10个表:');
      tablesResult.data.rows.forEach(row => console.log(`  - ${row[0]}`));
    }
    
    console.log('\n🎉 达梦数据库连接测试完成！');
    
  } catch (error) {
    console.error('❌ 发生异常:', error.message);
  }
}

testDamengConnection();
