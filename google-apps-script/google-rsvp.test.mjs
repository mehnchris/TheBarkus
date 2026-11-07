import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

test('Google RSVP validation, private writes, retries, and safe text',()=>{
 const rows=[['headers']]; let flushes=0; let released=0;
 const sheet={getLastRow:()=>rows.length,getRange:(row,col,length,width)=>({
   createTextFinder:text=>({matchEntireCell:()=>({findNext:()=>rows.slice(1).find(r=>r[1]===text)||null})}),
   setNumberFormat:()=>({setValues:values=>{rows[row-1]=values[0];}})
 })};
 const context=vm.createContext({console,PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'private-id'})},
   SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:()=>flushes++},
   LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>released++})},
   CacheService:{getScriptCache:()=>({get:()=>null,put:()=>{}})},
   Utilities:{base64EncodeWebSafe:()=> 'hash',computeDigest:()=>[],DigestAlgorithm:{SHA_256:'SHA_256'}}});
 vm.runInContext(readFileSync(new URL('./Code.gs',import.meta.url),'utf8'),context);
 const input={name:'=SUM(1,2)',email:'GUEST@example.com',attending:'yes',plusOne:'Partner',song:'A song',note:'@formula',requestId:'12345678-1234-1234-1234-123456789000'};
 assert.equal(context.submitRsvp(input).ok,true);
 assert.equal(rows.length,2);assert.equal(flushes,1);assert.equal(rows[1][2],"'=SUM(1,2)");assert.equal(rows[1][3],'guest@example.com');assert.equal(rows[1][7],"'@formula");
 assert.equal(context.submitRsvp(input).ok,true);assert.equal(rows.length,2);assert.equal(flushes,1);
 assert.equal(context.submitRsvp({...input,requestId:'abcdef12-1234-1234-1234-123456789000',attending:'no'}).ok,true);
 assert.equal(rows[2][5],'');assert.equal(rows[2][6],'');
 for(const bad of [{...input,email:'bad'},{...input,note:'x'.repeat(2001)},{...input,attending:'maybe'},{...input,website:'spam'},{...input,name:42}]) assert.equal(context.submitRsvp(bad).ok,false);
 assert.equal(released,3);
});

test('Initialization uses the bound sheet, preserves responses, and rejects public calls or mismatched headers', () => {
 const source=readFileSync(new URL('./Code.gs',import.meta.url),'utf8');
 const headers=['Received at','Request ID','Guest name','Email','Attending','Plus-one name','Song request','Note to the couple'];
 let rows=[];let savedId;let inserted=0;let hasSheet=false;let active=true;
 const range={getValues:()=>[rows[0]],setValues:values=>{rows=values;return range;},setBackground:()=>range,setFontColor:()=>range,setFontWeight:()=>range};
 const sheet={getLastRow:()=>rows.length,getRange:()=>range,setFrozenRows:()=>{},setColumnWidths:()=>{},setColumnWidth:()=>{}};
 const spreadsheet={getSheetByName:()=>hasSheet?sheet:null,insertSheet:()=>{inserted++;hasSheet=true;return sheet;},setSpreadsheetTimeZone:()=>{},getId:()=> 'couple-sheet',getUrl:()=> 'private-sheet-url'};
 const context=vm.createContext({console:{log:()=>{}},PropertiesService:{getScriptProperties:()=>({getProperty:()=>savedId,setProperty:(key,value)=>{savedId=value;}})},SpreadsheetApp:{getActiveSpreadsheet:()=>active?spreadsheet:null,getUi:()=>({}),openById:()=>spreadsheet}});
 vm.runInContext(source,context);
 context.initializeRsvp();assert.equal(inserted,1);assert.equal(savedId,'couple-sheet');assert.equal(JSON.stringify(rows[0]),JSON.stringify(headers));
 rows.push(['existing response']);context.initializeRsvp();assert.equal(rows.length,2);assert.equal(inserted,1);
 rows[0]=['unrelated data'];assert.throws(()=>context.initializeRsvp(),/headers differ/);assert.equal(rows[0][0],'unrelated data');
 active=false;assert.throws(()=>context.initializeRsvp(),/spreadsheet script editor/);
});
