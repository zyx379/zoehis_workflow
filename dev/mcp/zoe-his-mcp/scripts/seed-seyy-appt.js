import fs from 'fs';
import oracledb from 'oracledb';

function fail(e) {
  fs.writeFileSync('scripts/seed-result.json', JSON.stringify({ fatal: (e && e.stack) ? e.stack : String(e) }, null, 2));
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

  const pid = await conn.execute(
    "SELECT PATIENT_ID FROM ZOEPATIENT.PAT_OUTP_PATIENT_CLINIC_INFO WHERE CARD_ID = '123' AND ROWNUM = 1"
  );
  const patientId = pid.rows[0] && pid.rows[0].PATIENT_ID;
  out.patientId = patientId;
  if (!patientId) {
    out.error = '卡号123未找到对应PATIENT_ID';
    fs.writeFileSync('scripts/seed-result.json', JSON.stringify(out, null, 2));
    process.exit(0);
  }

  // 主键用 UUID（与现有数据风格一致）
  const guid = await conn.execute('SELECT RAWTOHEX(SYS_GUID()) AS ID FROM DUAL');
  const newId = guid.rows[0].ID;
  out.newId = newId;

  await conn.execute(
    `INSERT INTO ZOEAPPT.APT_OUTP_APPT_RECORD
       (OUTP_APPT_RECORD_ID, PATIENT_ID, APPT_WAY, APPT_STATUS_CODE, OPERATED_TIME, APPT_TIME)
     VALUES (:id, :pid, 'channel_health', '0', SYSDATE, SYSDATE)`,
    { id: newId, pid: patientId }
  );
  out.inserted = true;

  const chk = await conn.execute(
    `SELECT OUTP_APPT_RECORD_ID, PATIENT_ID, APPT_WAY, APPT_STATUS_CODE, OPERATED_TIME
       FROM ZOEAPPT.APT_OUTP_APPT_RECORD WHERE OUTP_APPT_RECORD_ID = :id`,
    { id: newId }
  );
  out.verify = chk.rows;

  await conn.commit();
  out.committed = true;
} catch (e) {
  out.error = e && e.message ? e.message : String(e);
  if (conn) { try { await conn.rollback(); } catch (_) {} }
} finally {
  if (conn) { try { await conn.close(); } catch (_) {} }
}
fs.writeFileSync('scripts/seed-result.json', JSON.stringify(out, null, 2));
