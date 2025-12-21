import { ProctorLog, IProctorLog } from '../models/adminModel.js';

export interface ProctorLogResult {
  ok: boolean;
}

export function recordProctorLog(payload: Partial<IProctorLog>): ProctorLogResult {
  const log = new ProctorLog(payload);
  console.log('[PROCTOR-LOG]', log.timestamp, JSON.stringify(log));
  return { ok: true };
}
