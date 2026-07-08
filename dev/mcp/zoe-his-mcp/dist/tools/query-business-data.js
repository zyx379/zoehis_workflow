/**
 * 查询业务数据工具 - 执行只读 SQL
 */
import { getEnvConfig } from '../config.js';
import { exec } from 'child_process';

const MAX_ROWS = 100;

// Oracle 连接（使用 oracledb 驱动）
async function executeOracleQuery(host, port, username, password, serviceName, sid, sql) {
    // 动态导入 oracledb，避免在不需要时加载
    console.error('[DEBUG] Importing oracledb module...');
    const oracledbModule = await import('oracledb');
    console.error('[DEBUG] oracledb module keys:', Object.keys(oracledbModule));
    const oracledb = oracledbModule.default || oracledbModule;
    console.error('[DEBUG] oracledb type:', typeof oracledb);
    console.error('[DEBUG] getConnection type:', typeof oracledb.getConnection);
    console.error('[DEBUG] OUT_FORMAT_ARRAY:', oracledb.OUT_FORMAT_ARRAY);
    if (typeof oracledb.getConnection !== 'function') {
        console.error('[ERROR] getConnection is not a function!');
        console.error('[DEBUG] oracledb object:', JSON.stringify(Object.keys(oracledb).slice(0, 20)));
        throw new Error('oracledb.getConnection is not a function');
    }
    const connectionString = serviceName
        ? `${host}:${port}/${serviceName}`
        : `${host}:${port}:${sid}`;
    const connection = await oracledb.getConnection({
        user: username,
        password: password,
        connectString: connectionString,
    });
    try {
        const startTime = Date.now();
        const result = await connection.execute(sql, [], {
            outFormat: oracledb.OUT_FORMAT_ARRAY,
            maxRows: MAX_ROWS,
        });
        const executionTime = Date.now() - startTime;
        const columns = result.metaData?.map((m) => m.name) || [];
        const rows = result.rows || [];
        return {
            columns,
            rows,
            rowCount: rows.length,
            executionTime,
        };
    }
    finally {
        await connection.close();
    }
}

// 达梦连接（使用预编译的 JDBC 工具）
async function executeDamengQuery(host, port, username, password, schema, sql) {
    return new Promise((resolve, reject) => {
        // 使用预编译的 DamengQuery.class 文件
        const mcpPath = process.cwd();
        const command = `java -cp "${mcpPath};C:\\dmdbms\\drivers\\jdbc\\DmJdbcDriver11.jar" DamengQuery "${host}" "${port}" "${username}" "${password}" "${sql}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('JDBC execution error:', error.message);
                if (stderr) console.error('stderr:', stderr);
                reject(new Error('JDBC execution failed: ' + error.message));
            } else {
                if (stderr && stderr.startsWith('ERROR:')) {
                    reject(new Error(stderr.substring(6).trim()));
                } else {
                    try {
                        const result = JSON.parse(stdout);
                        resolve({
                            columns: result.columns,
                            rows: result.rows,
                            rowCount: result.rowCount,
                            executionTime: 0,
                        });
                    } catch (parseError) {
                        reject(new Error('Failed to parse JDBC result: ' + parseError.message + ' - Output: ' + stdout));
                    }
                }
            }
        });
    });
}

export async function queryBusinessData(args) {
    try {
        const { dataSourceConfig } = getEnvConfig();
        if (!dataSourceConfig) {
            return {
                success: false,
                error: '未配置数据源，请设置 ZOE_DB_TYPE 等环境变量'
            };
        }
        const trimmedSql = args.sql.trim().toUpperCase();
        if (!trimmedSql.startsWith('SELECT')) {
            return {
                success: false,
                error: '只允许执行 SELECT 查询语句'
            };
        }
        let limitedSql = args.sql;
        if (dataSourceConfig.type === 'oracle') {
            limitedSql = `SELECT * FROM (${args.sql}) WHERE ROWNUM <= ${MAX_ROWS}`;
        }
        else if (dataSourceConfig.type === 'dameng') {
            limitedSql = `SELECT TOP ${MAX_ROWS} * FROM (${args.sql})`;
        }
        let result;
        if (dataSourceConfig.type === 'oracle') {
            result = await executeOracleQuery(dataSourceConfig.host, dataSourceConfig.port, dataSourceConfig.username, dataSourceConfig.password, dataSourceConfig.serviceName, dataSourceConfig.sid, limitedSql);
        }
        else if (dataSourceConfig.type === 'dameng') {
            result = await executeDamengQuery(dataSourceConfig.host, dataSourceConfig.port, dataSourceConfig.username, dataSourceConfig.password, dataSourceConfig.schema, limitedSql);
        }
        else {
            return { success: false, error: '不支持的数据库类型' };
        }
        return {
            success: true,
            data: {
                description: args.description,
                columns: result.columns,
                rows: result.rows,
                rowCount: result.rowCount,
                executionTime: result.executionTime,
                limited: result.rowCount >= MAX_ROWS,
                maxRows: MAX_ROWS,
            }
        };
    }
    catch (error) {
        console.error('Query business data error:', error);
        return { success: false, error: error.message };
    }
}
//# sourceMappingURL=query-business-data.js.map
