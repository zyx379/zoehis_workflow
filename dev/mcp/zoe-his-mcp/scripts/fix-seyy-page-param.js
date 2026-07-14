/**
 * seyy：预约渠道页面参数收敛为单一 appt_way_health_show，删除 appt_way_health_query
 */
import fs from 'fs'
import oracledb from 'oracledb'

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT
const cfg = {
  user: process.env.ZOE_DB_seyy_USERNAME || process.env.ZOE_DB_SEYY_USERNAME,
  password: process.env.ZOE_DB_seyy_PASSWORD || process.env.ZOE_DB_SEYY_PASSWORD,
  connectString: `${process.env.ZOE_DB_seyy_HOST || process.env.ZOE_DB_SEYY_HOST}:${
    process.env.ZOE_DB_seyy_PORT || process.env.ZOE_DB_SEYY_PORT
  }/${process.env.ZOE_DB_seyy_SERVICE_NAME || process.env.ZOE_DB_SEYY_SERVICE_NAME}`,
}

const out = {}
let conn
try {
  conn = await oracledb.getConnection(cfg)
  await conn.execute(
    `UPDATE ZOECOMM.COM_PAGE_AUTHORITY_CONTROL
        SET STATE = '1',
            FUNCTION = '门诊诊病预约渠道徽标：开启后查预约渠道并显示（channel_health）',
            DEFAULT_CODE = '0',
            PAGE_TYPE_ID = '1',
            MENU_ID = '14'
      WHERE SEQUENCE_NO = '|14|appt_way_health_show|'`
  )
  const del = await conn.execute(
    `DELETE FROM ZOECOMM.COM_PAGE_AUTHORITY_CONTROL
      WHERE SEQUENCE_NO = '|14|appt_way_health_query|'`
  )
  out.deletedQuery = del.rowsAffected
  const verify = await conn.execute(
    `SELECT SEQUENCE_NO, MENU_NO, STATE, FUNCTION
       FROM ZOECOMM.COM_PAGE_AUTHORITY_CONTROL
      WHERE MENU_ID = '14' AND MENU_NO LIKE 'appt_way_health%'
      ORDER BY MENU_NO`
  )
  out.verify = verify.rows
  await conn.commit()
  out.committed = true
} catch (e) {
  out.error = e && e.message ? e.message : String(e)
  if (conn) {
    try {
      await conn.rollback()
    } catch (_) {}
  }
} finally {
  if (conn) {
    try {
      await conn.close()
    } catch (_) {}
  }
}
fs.writeFileSync('scripts/fix-page-param-result.json', JSON.stringify(out, null, 2))
console.log(JSON.stringify(out, null, 2))
