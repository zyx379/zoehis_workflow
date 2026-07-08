import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';

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

// 使用 JDBC 连接达梦数据库
function testJdbcConnection() {
  console.log('🔍 Testing DM database connection (JDBC)...');
  
  const host = process.env.ZOE_DB_HOST || '132.1.40.61';
  const port = process.env.ZOE_DB_PORT || '5251';
  const username = process.env.ZOE_DB_USERNAME || 'SYSDBA';
  const password = process.env.ZOE_DB_PASSWORD || 'Zoe$2025sysdbA';
  
  const javaCode = `
import java.sql.*;
public class TestDMConnection {
    public static void main(String[] args) {
        try {
            Class.forName("dm.jdbc.driver.DmDriver");
            String url = "jdbc:dm://${host}:${port}/";
            Connection conn = DriverManager.getConnection(url, "${username}", "${password}");
            System.out.println("SUCCESS: Connected to database");
            
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT SYSDATE FROM DUAL");
            if (rs.next()) {
                System.out.println("Current time: " + rs.getString(1));
            }
            
            rs.close();
            stmt.close();
            conn.close();
            System.exit(0);
        } catch (Exception e) {
            System.out.println("ERROR: Connection failed - " + e.getMessage());
            System.exit(1);
        }
    }
}
`;
    
    // Write temporary Java file
    const javaFile = 'TestDMConnection.java';
    writeFileSync(javaFile, javaCode);
    
    // Compile and run
    exec(`cd C:\\dmdbms\\jdk\\bin && javac -encoding UTF-8 -cp C:\\dmdbms\\drivers\\jdbc\\DmJdbcDriver11.jar ${process.cwd()}\\${javaFile} && java -cp "${process.cwd()};C:\\dmdbms\\drivers\\jdbc\\DmJdbcDriver11.jar" TestDMConnection`, (error, stdout, stderr) => {
      // Cleanup
      try { unlinkSync(javaFile); } catch {}
      try { unlinkSync(javaFile.replace('.java', '.class')); } catch {}
      
      if (error) {
        console.log('❌ JDBC test failed:', error.message);
        if (stderr) console.log('stderr:', stderr);
      } else {
        console.log(stdout);
        if (stderr) console.log('stderr:', stderr);
      }
    });
}

testJdbcConnection();
