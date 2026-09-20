import http from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

const root = fileURLToPath(new URL('.', import.meta.url));
export function createWeddingServer({ dataDir = process.env.DATA_DIR || join(root, 'data'), rateLimit = 15 } = {}) {
 mkdirSync(dataDir, {recursive:true, mode:0o700});
 const db = new DatabaseSync(join(dataDir, 'rsvps.sqlite'));
 db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS rsvps (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, attending TEXT NOT NULL, plus_one TEXT NOT NULL, song TEXT NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(email, name));`);
 const limits = new Map();
 const files = {'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/styles.css':['styles.css','text/css; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/wedding.ics':['wedding.ics','text/calendar; charset=utf-8']};
 const server = http.createServer(async (req,res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  const json = (code, payload) => { res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(payload)); };
  try {
   const path = new URL(req.url, 'http://localhost').pathname;
   if (path === '/api/rsvp') {
    if (req.method !== 'POST') { res.setHeader('Allow','POST'); return json(405,{error:'Method not allowed.'}); }
    if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return json(403,{error:'Please submit your RSVP from this website.'});
    if (!(req.headers['content-type'] || '').startsWith('application/json')) return json(415,{error:'Please submit the RSVP form on this website.'});
    const ip = req.socket.remoteAddress;
    const now = Date.now();
    for (const [key, value] of limits) if (now - value.start > 600000) limits.delete(key);
    const usage = limits.get(ip) || {start:now,count:0}; usage.count++; limits.set(ip,usage);
    if (usage.count > rateLimit) return json(429,{error:'Too many attempts. Please try again in 10 minutes.'});
    let body = ''; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 12000) { json(413,{error:'Your response is too long.'}); return; } body += chunk; }
    let value; try { value = JSON.parse(body); } catch { return json(400,{error:'Invalid response. Please try again.'}); }
    if (!value || typeof value !== 'object' || Array.isArray(value)) return json(400,{error:'Invalid response.'});
    if (value.website) return json(400,{error:'Please leave the website field empty.'});
    const bounds = {name:120,email:254,plusOne:120,song:200,note:2000};
    const fields = {};
    for (const [key,max] of Object.entries(bounds)) { if (value[key] !== undefined && typeof value[key] !== 'string') return json(400,{error:'Please check your response fields.'}); fields[key] = (value[key] || '').trim(); if(fields[key].length > max) return json(400,{error:`The ${key} field is too long.`}); }
    if (!fields.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) || !['yes','no'].includes(value.attending)) return json(400,{error:'Please enter your name, a valid email, and whether you can attend.'});
    const timestamp = new Date().toISOString();
    db.prepare(`INSERT INTO rsvps (id,name,email,attending,plus_one,song,note,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(email,name) DO UPDATE SET attending=excluded.attending,plus_one=excluded.plus_one,song=excluded.song,note=excluded.note,updated_at=excluded.updated_at`).run(randomUUID(),fields.name,fields.email.toLowerCase(),value.attending,value.attending === 'yes' ? fields.plusOne : '',value.attending === 'yes' ? fields.song : '',fields.note,timestamp,timestamp);
    return json(200,{message:value.attending === 'yes' ? 'You’re on the list! Your RSVP has been saved. We can’t wait to celebrate with you.' : 'Your RSVP has been saved. We’ll miss you and appreciate you letting us know.'});
   }
   if (!['GET','HEAD'].includes(req.method)) return json(405,{error:'Method not allowed.'});
   const asset = files[path];
   if (!asset) { res.writeHead(404,{'Content-Type':'text/plain'}); return res.end('Page not found.'); }
   const content = readFileSync(join(root,'public',asset[0]));
   res.writeHead(200,{'Content-Type':asset[1],'Cache-Control':'no-cache'});
   res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) { console.error('Request failed:',error.message); if (!res.headersSent) json(500,{error:'We couldn’t save your response. Please try again later.'}); else res.end(); }
 });
 server.on('close', () => db.close());
 return server;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file:///${process.argv[1].replaceAll('\\','/')}`))) {
 const port = Number(process.env.PORT || 3000);
 const host = process.env.HOST || '127.0.0.1';
 createWeddingServer().listen(port,host,() => console.log(`Wedding website: http://${host}:${port}`));
}
