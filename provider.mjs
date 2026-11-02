import { randomUUID } from 'node:crypto';

export class ProviderError extends Error { constructor(message, status = 502) { super(message); this.status = status; } }
export class Infermedica {
  constructor({ appId, appKey, fetcher = fetch }) { this.appId = appId; this.appKey = appKey; this.fetcher = fetcher; }
  async request(path, body, interviewId) {
    if (!this.appId || !this.appKey) throw new ProviderError('Live provider credentials are not configured.', 503);
    let response;
    try { response = await this.fetcher(`https://api.infermedica.com/v3/${path}`, { method: 'POST', headers: {'Content-Type':'application/json','App-Id':this.appId,'App-Key':this.appKey,'Interview-Id':interviewId || randomUUID()}, body:JSON.stringify(body), signal:AbortSignal.timeout(15000) }); }
    catch { throw new ProviderError('The provider could not be reached. No new assessment was saved.', 503); }
    if (!response.ok) throw new ProviderError(response.status === 429 ? 'The provider rate limit or quota was reached. Try later.' : `The provider rejected or could not complete this request (HTTP ${response.status}).`, response.status === 429 ? 429 : 502);
    try { return await response.json(); } catch { throw new ProviderError('The provider returned an invalid response.'); }
  }
  parse(text, age, interviewId) { return this.request('parse', {text, age}, interviewId); }
  diagnosis(sex, age, evidence, interviewId) { return this.request('diagnosis', {sex, age, evidence}, interviewId); }
}
export function normalizeEvidence(items) {
  const map = new Map();
  for (const item of items) {
    if (!item || !/^[sp]_\d+$/.test(item.id) || !['present','absent','unknown'].includes(item.choice_id)) throw new ProviderError('Invalid evidence.', 400);
    map.set(item.id, {id:item.id, choice_id:item.choice_id, ...(item.source === 'initial' ? {source:'initial'} : {})});
  }
  return [...map.values()];
}
export function stopReason(result, count) {
  if (result.has_emergency_evidence) return 'Emergency evidence reported by provider';
  if (result.should_stop) return 'Provider recommends stopping';
  if (count >= 10) return 'Ten diagnostic questions answered';
  if (!result.question) return 'No further supported question returned';
  return null;
}
