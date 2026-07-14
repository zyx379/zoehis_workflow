/**
 * seyy 测试库造数：卡号123 → 康复科预约渠道 channel_health + 页面参数门控开启
 * 使门诊诊病读卡条能显示卫健委/预约渠道徽标（apptWay === channel_health）
 *
 * 依赖：.env 中 ZOE_DB_seyy_* ；npm 包 oracledb
 * 用法：在 zoe-his-mcp 目录执行  node --env-file=.env scripts/seed-seyy-appt.js
 */
import fs from 'fs'
import oracledb from 'oracledb'

function fail(e) {
  fs.writeFileSync(
    'scripts/seed-result.json',
    JSON.stringify({ fatal: e && e.stack ? e.stack : String(e) }, null, 2)
  )
}
process.on('uncaughtException', fail)
process.on('unhandledRejection', fail)

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT

const cfg = {
  user: process.env.ZOE_DB_seyy_USERNAME || process.env.ZOE_DB_SEYY_USERNAME,
  password: process.env.ZOE_DB_seyy_PASSWORD || process.env.ZOE_DB_SEYY_PASSWORD,
  connectString: `${process.env.ZOE_DB_seyy_HOST || process.env.ZOE_DB_SEYY_HOST}:${
    process.env.ZOE_DB_seyy_PORT || process.env.ZOE_DB_SEYY_PORT
  }/${process.env.ZOE_DB_seyy_SERVICE_NAME || process.env.ZOE_DB_SEYY_SERVICE_NAME}`,
}

const CARD_ID = '123'
const DEPT_CODE = '1003' // 康复科（与界面当前科室一致）
const APPT_WAY = 'channel_health'
const out = { cardId: CARD_ID, deptCode: DEPT_CODE, apptWay: APPT_WAY }

let conn
try {
  conn = await oracledb.getConnection(cfg)

  const clinic = await conn.execute(
    `SELECT PATIENT_ID, PATIENT_NAME, EVENT_NO, CLINIC_DEPT_CODE
       FROM ZOEPATIENT.PAT_OUTP_PATIENT_CLINIC_INFO
      WHERE CARD_ID = :card
        AND PATIENT_ID IS NOT NULL
      ORDER BY REGISTER_TIME DESC
      FETCH FIRST 1 ROWS ONLY`,
    { card: CARD_ID }
  )
  const row = clinic.rows[0]
  if (!row) {
    out.error = '卡号123未找到诊病记录'
    fs.writeFileSync('scripts/seed-result.json', JSON.stringify(out, null, 2))
    process.exit(0)
  }
  const patientId = row.PATIENT_ID
  const patientName = row.PATIENT_NAME || '小龙虾'
  const eventNo = row.EVENT_NO
  out.patientId = patientId
  out.patientName = patientName
  out.eventNo = eventNo

  // 1) 补齐/插入预约记录：接口 OutpApptRecord.get({ patientId, deptCode }) 按科室匹配
  const exist = await conn.execute(
    `SELECT OUTP_APPT_RECORD_ID, DEPT_CODE, EVENT_NO, APPT_WAY
       FROM ZOEAPPT.APT_OUTP_APPT_RECORD
      WHERE PATIENT_ID = :pid
        AND APPT_WAY = :way
      ORDER BY OPERATED_TIME DESC
      FETCH FIRST 1 ROWS ONLY`,
    { pid: patientId, way: APPT_WAY }
  )

  if (exist.rows[0]) {
    const id = exist.rows[0].OUTP_APPT_RECORD_ID
    await conn.execute(
      `UPDATE ZOEAPPT.APT_OUTP_APPT_RECORD
          SET DEPT_CODE = :dept,
              PATIENT_NAME = :pname,
              EVENT_NO = NVL(:eno, EVENT_NO),
              APPT_STATUS_CODE = NVL(APPT_STATUS_CODE, '0'),
              APPT_TIME = NVL(APPT_TIME, SYSDATE),
              OPERATED_TIME = SYSDATE
        WHERE OUTP_APPT_RECORD_ID = :id`,
      { dept: DEPT_CODE, pname: patientName, eno: eventNo, id }
    )
    out.apptAction = 'update'
    out.outpApptRecordId = id
  } else {
    const guid = await conn.execute('SELECT RAWTOHEX(SYS_GUID()) AS ID FROM DUAL')
    const newId = guid.rows[0].ID
    await conn.execute(
      `INSERT INTO ZOEAPPT.APT_OUTP_APPT_RECORD
         (OUTP_APPT_RECORD_ID, PATIENT_ID, PATIENT_NAME, DEPT_CODE, EVENT_NO,
          APPT_WAY, APPT_STATUS_CODE, OPERATED_TIME, APPT_TIME)
       VALUES (:id, :pid, :pname, :dept, :eno, :way, '0', SYSDATE, SYSDATE)`,
      {
        id: newId,
        pid: patientId,
        pname: patientName,
        dept: DEPT_CODE,
        eno: eventNo,
        way: APPT_WAY,
      }
    )
    out.apptAction = 'insert'
    out.outpApptRecordId = newId
  }

  // 2) 页面参数 configId=14：单一开关（查接口 + 显示徽标）
  const pageKey = {
    menuNo: 'appt_way_health_show',
    functionDesc: '门诊诊病预约渠道徽标：开启后查预约渠道并显示（channel_health）',
  }
  out.pageParams = []
  const seq = `|14|${pageKey.menuNo}|`
  const chk = await conn.execute(
    `SELECT SEQUENCE_NO, STATE FROM ZOECOMM.COM_PAGE_AUTHORITY_CONTROL
      WHERE SEQUENCE_NO = :seq`,
    { seq }
  )
  if (chk.rows[0]) {
    await conn.execute(
      `UPDATE ZOECOMM.COM_PAGE_AUTHORITY_CONTROL
          SET STATE = '1', MENU_NO = :mno, MENU_ID = '14', PAGE_TYPE_ID = '1',
              FUNCTION = :fn, DEFAULT_CODE = '0'
        WHERE SEQUENCE_NO = :seq`,
      { mno: pageKey.menuNo, fn: pageKey.functionDesc, seq }
    )
    out.pageParams.push({ menuNo: pageKey.menuNo, action: 'update', state: '1' })
  } else {
    await conn.execute(
      `INSERT INTO ZOECOMM.COM_PAGE_AUTHORITY_CONTROL
         (SEQUENCE_NO, MENU_NO, STATE, FUNCTION, PAGE_TYPE_ID, MENU_ID, DEFAULT_CODE)
       VALUES (:seq, :mno, '1', :fn, '1', '14', '0')`,
      { seq, mno: pageKey.menuNo, fn: pageKey.functionDesc }
    )
    out.pageParams.push({ menuNo: pageKey.menuNo, action: 'insert', state: '1' })
  }
  // 清理历史双参数中的 query 项
  const delQuery = await conn.execute(
    `DELETE FROM ZOECOMM.COM_PAGE_AUTHORITY_CONTROL
      WHERE SEQUENCE_NO = '|14|appt_way_health_query|'`
  )
  out.deletedQueryParam = delQuery.rowsAffected

  // 验证：模拟接口条件
  const verifyAppt = await conn.execute(
    `SELECT OUTP_APPT_RECORD_ID, PATIENT_ID, PATIENT_NAME, DEPT_CODE, EVENT_NO, APPT_WAY, APPT_STATUS_CODE,
            (SELECT DT.VALUE_NAME FROM ZOEDICT.DIC_BASIC_DICT DT
              WHERE DT.VALUE_CODE = T.APPT_WAY AND DT.DICT_NAME = 'APPT_WAY_DICT') AS APPT_WAY_NAME
       FROM ZOEAPPT.APT_OUTP_APPT_RECORD T
      WHERE PATIENT_ID = :pid AND DEPT_CODE = :dept
      ORDER BY APPT_TIME DESC, OPERATED_TIME DESC
      FETCH FIRST 1 ROWS ONLY`,
    { pid: patientId, dept: DEPT_CODE }
  )
  out.verifyAppt = verifyAppt.rows

  const verifyPage = await conn.execute(
    `SELECT SEQUENCE_NO, MENU_NO, STATE, FUNCTION, MENU_ID
       FROM ZOECOMM.COM_PAGE_AUTHORITY_CONTROL
      WHERE MENU_ID = '14'
        AND MENU_NO LIKE 'appt_way_health%'
      ORDER BY MENU_NO`
  )
  out.verifyPageParams = verifyPage.rows

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
fs.writeFileSync('scripts/seed-result.json', JSON.stringify(out, null, 2))
console.log(JSON.stringify(out, null, 2))
