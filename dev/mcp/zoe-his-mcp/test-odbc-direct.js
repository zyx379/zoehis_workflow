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
  }
}

loadEnvFile();

import('odbc').then(async (odbc) => {
  console.log('🔍 测试 ODBC 驱动加载...');
  
  // 测试1: 列出所有可用的 ODBC 驱动
  try {
    const drivers = await odbc.drivers();
    console.log('✅ 可用的 ODBC 驱动:');
    Object.keys(drivers).forEach(driver => {
      console.log(`  - ${driver}`);
    });
  } catch (e) {
    console.log('❌ 获取驱动列表失败:', e.message);
  }
  
  // 测试2: 尝试连接达梦数据库
  console.log('\n🔍 测试达梦数据库连接...');
  const host = process.env.ZOE_DB_HOST || '132.1.40.61';
  const port = process.env.ZOE_DB_PORT || '5251';
  const username = process.env.ZOE_DB_USERNAME || 'SYSDBA';
  const password = process.env.ZOE_DB_PASSWORD || 'Zoe$2025sysdbA';
  
  // 尝试多种连接字符串格式
  const connectionStrings = [
    `DRIVER={DM8 ODBC DRIVER};SERVER=${host};PORT=${port};UID=${username};PWD=${password}`,
    `DRIVER=C:\\dmdbms\\drivers\\odbc\\dodbc.dll;SERVER=${host};PORT=${port};UID=${username};PWD=${password}`,
    `SERVER=${host};PORT=${port};UID=${username};PWD=${password};DRIVER=C:\\dmdbms\\drivers\\odbc\\dodbc.dll`,
  ];
  
  for (let i = 0; i < connectionStrings.length; i++) {
    console.log(`\n尝试连接字符串 ${i + 1}:`);
    console.log(connectionStrings[i]);
    
    try {
      const connection = await odbc.connect(connectionStrings[i]);
      console.log('✅ 连接成功！');
      
      // 查询测试
      const result = await connection.query('SELECT SYSDATE FROM DUAL');
      console.log('✅ 查询成功:', result);
      
      await connection.close();
      break;
    } catch (error) {
      console.log('❌ 连接失败:', error.message);
    }
  }
}).catch(console.error);
