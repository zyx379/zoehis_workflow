import fs from 'fs';
import oracledb from 'oracledb';

function fail(e) {
  fs.writeFileSync('scripts/probe-partition-result.json', JSON.stringify({ fatal: (e && e.stack) ? e.stack : String(e) }, null, 2));
}
process.on('uncaughtException', fail);
process.on('unhandledRejection', fail);

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const cfg = {
  user: process.env.ZOE_DB_SEYY_USERNAME,
  password: process.env.ZOE_DB_SEYY_PASSWORD,
  connectString: `${process.env.ZOE_DB_SEYY_HOST}:${process.env.ZOE_DB_SEYY_PORT}/${process.env.ZOE_DB_SEYY_SERVICE_NAME}`,
};
const out = {};
let conn;
try {
  conn = await oracledb.getConnection(cfg);
  // 分区键列
  const pk = await conn.execute(
    `SELECT COLUMN_NAME, COLUMN_POSITION
       FROM ALL_PART_KEY_COLUMNS
      WHERE NAME = 'APT_OUTP_APPT_RECORD' AND OWNER = 'ZOEAPPT'`
  );
  out.partitionKeyCols = pk.rows;

  // 分区类型与列（partial）
  const pt = await conn.execute(
    `SELECT PARTITIONING_TYPE, COLUMN_NAME, COUNT(*) OVER() AS TOTAL
       FROM ALL_PART_TABLES t
       JOIN ALL_PART_KEY_COLUMNS k ON k.NAME = t.TABLE_NAME AND k.OWNER = t.OWNER
      WHERE t.TABLE_NAME = 'APT_OUTP_APPT_RECORD' AND t.OWNER = 'ZOEAPPT'`
  );
  out.partType = pt.rows;

  // 现有样例行的分区键列实际值（取最近几行）
  const sample = await conn.execute(
    `SELECT OUTP_APPT_RECORD_ID, PATIENT_ID, APPT_WAY, APPT_STATUS_CODE
       FROM ZOEAPPT.APT_OUTP_APPT_RECORD
      WHERE ROWNUM <= 1 ORDER BY OUTP_APPT_RECORD_ID DESC`
  );
  out.sample = sample.rows;

  // 查是否存在 APPT_TIME / CREATE_TIME 之类日期列，并看样例值
  const cols = await conn.execute(
    `SELECT COLUMN_NAME, DATA_TYPE
       FROM ALL_TAB_COLUMNS
      WHERE OWNER = 'ZOEAPPT' AND TABLE_NAME = 'APT_OUTP_APPT_RECORD'
        AND (DATA_TYPE LIKE 'DATE%' OR COLUMN_NAME LIKE '%TIME%' OR COLUMN_NAME LIKE '%DATE%')`
  );
  out.dateCols = cols.rows;
} catch (e) {
  out.error = e && e.message ? e.message : String(e);
} finally {
  if (conn) { try { await conn.close(); } catch (_) {} }
}
fs.writeFileSync('scripts/probe-partition-result.json', JSON.stringify(out, null, 2));
