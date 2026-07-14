import { writeFileSync } from 'fs';
import { queryBusinessData } from '../dist/tools/query-business-data.js';

const cfgs = [
  {
    description: '卡号123找patient_id(仅查存在列)',
    sql: `SELECT PATIENT_ID, CARD_ID FROM ZOEPATIENT.PAT_OUTP_PATIENT_CLINIC_INFO WHERE CARD_ID='123'`,
  },
  {
    description: '卡号123在预约相关卡表COM_PATIENT_CARD_LIST',
    sql: `SELECT PATIENT_ID, CARD_NO, CARD_ID FROM ZOECOMM.COM_PATIENT_CARD_LIST WHERE CARD_NO='123' OR CARD_ID='123'`,
  },
];

const out = [];
for (const c of cfgs) {
  const r = await queryBusinessData({ sql: c.sql, description: c.description });
  out.push({ step: c.description, result: r });
}
writeFileSync('scripts/probe-result.json', JSON.stringify(out, null, 2));
console.log('DONE');
