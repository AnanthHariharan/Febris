import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { Infermedica, normalizeEvidence, ProviderError } from './provider.mjs';
const provider = new Infermedica({appId:process.env.INFERMEDICA_APP_ID, appKey:process.env.INFERMEDICA_APP_KEY});
const port = Number(process.env.PORT || 3000);
const files = {'/':'index.html','/app.js':'app.js','/evidence.js':'evidence.js','/style.css':'style.css'};
const server = http.createServer(async (req,res) => {
  res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'");
  try {
    if (req.method === 'GET' && files[req.url]) { const f=files[req.url]; const data=await readFile(new URL(`./public/${f}`,import.meta.url)); res.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html; charset=utf-8'}); return res.end(data); }
    if (req.method !== 'POST' || !['/api/parse','/api/diagnosis'].includes(req.url)) { res.writeHead(404); return res.end(); }
    const allowedHosts = [`localhost:${port}`, `127.0.0.1:${port}`];
    if (!allowedHosts.includes(req.headers.host) || !allowedHosts.some(host => req.headers.origin === `http://${host}`)) throw new ProviderError('Origin not allowed.',403);
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) throw new ProviderError('JSON content type required.',415);
    let body=''; for await (const chunk of req) { body+=chunk; if (body.length>20000) throw new ProviderError('Request too large.',413); }
    const data=JSON.parse(body); const age=data.age;
    if (typeof data.interviewId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.interviewId)) throw new ProviderError('Invalid interview identifier.',400);
    if (!age || !Number.isInteger(age.value) || age.unit !== 'year' || age.value < 18 || age.value > 130) throw new ProviderError('This prototype supports adults aged 18–130 only.',400);
    let result;
    if (req.url === '/api/parse') { if (typeof data.text !== 'string' || !data.text.trim() || data.text.length>4000) throw new ProviderError('Enter a short description.',400); result=await provider.parse(data.text,age,data.interviewId); }
    else { if (!['female','male'].includes(data.sex) || !Array.isArray(data.evidence) || data.evidence.length>100) throw new ProviderError('Complete the required intake.',400); const evidence=normalizeEvidence(data.evidence); if (!evidence.some(e=>e.choice_id==='present' && e.id.startsWith('s_'))) throw new ProviderError('Confirm at least one present symptom.',400); result=await provider.diagnosis(data.sex,age,evidence,data.interviewId); }
    res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify(result));
  } catch(e) { res.writeHead(e.status || 400,{'Content-Type':'application/json'}); res.end(JSON.stringify({error:e instanceof ProviderError ? e.message : 'Invalid request.'})); }
});
server.listen(port,'127.0.0.1',()=>console.log(`Febris available at http://localhost:${port}`));
