import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 加载环境变量
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

// 测试达梦数据库连接
async function testDamengConnection() {
  console.log('\n🔍 测试达梦数据库连接...');
  
  try {
    // 查询数据库版本
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
    }
    
    // 查询当前用户
    const userResult = await queryBusinessData({
      sql: "SELECT USER FROM DUAL",
      description: '查询当前用户'
    });
    
    if (userResult.success) {
      console.log(`\n当前用户: ${userResult.data.rows[0][0]}`);
    }
    
    // 查询表数量
    const tableCountResult = await queryBusinessData({
      sql: "SELECT COUNT(*) FROM USER_TABLES",
      description: '查询用户表数量'
    });
    
    if (tableCountResult.success) {
      console.log(`用户表数量: ${tableCountResult.data.rows[0][0]}`);
    }
    
  } catch (error) {
    console.error('❌ 发生异常:', error.message);
    console.log('\n⚠️ 注意：如果出现 ODBC 相关错误，需要安装达梦 ODBC 驱动并重新编译 odbc 包');
  }
}

testDamengConnection();
