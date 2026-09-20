import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { writeFileSync, existsSync } from 'node:fs';
const root = fileURLToPath(new URL('../',import.meta.url));
const data = process.env.DATA_DIR || join(root,'data');
const path = join(data,'rsvps.sqlite');
if (!existsSync(path)) { console.error('No RSVP database yet. Start the website first.'); process.exit(1); }
const db = new DatabaseSync(path,{readOnly:true});
const rows = db.prepare('SELECT name,email,attending,plus_one,song,note,created_at,updated_at FROM rsvps ORDER BY updated_at DESC').all();
const columns = ['name','email','attending','plus_one','song','note','created_at','updated_at'];
const escape = value => { let text = String(value ?? ''); if (/^[\s]*[=+@-]/.test(text)) text = "'" + text; return '"' + text.replaceAll('"','""') + '"'; };
const output = join(data,`rsvps-${Date.now()}.csv`);
writeFileSync(output,[columns.join(','),...rows.map(row=>columns.map(key=>escape(row[key])).join(','))].join('\r\n'),{mode:0o600});
db.close(); console.log(`Exported ${rows.length} responses to ${output}`);
