import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile}from'node:fs/promises';
const workflow=JSON.parse(await readFile(new URL('../automation/bookleaf-royalty-summary.json',import.meta.url),'utf8'));
const dataset=JSON.parse(await readFile(new URL('../data/bookleaf_sample_data.json',import.meta.url),'utf8'));
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function run(name,input,upstream={}){
  const node=workflow.nodes.find(n=>n.name===name);
  assert.equal(node.type,'n8n-nodes-base.code');
  const fn=new AsyncFunction('$input','$',node.parameters.jsCode);
  return (await fn({first:()=>({json:input})},label=>({first:()=>({json:upstream[label]})})))[0].json;
}
const payload=()=>({body:{request_id:'1729490000000x123456789012345678',author_id:'AUTH001',as_of:new Date().toISOString().slice(0,10),author:structuredClone(dataset.authors[0])}});
test('Export is inactive, credentials are references and graph targets exist',()=>{
  assert.equal(workflow.active,false);
  const names=new Set(workflow.nodes.map(n=>n.name));
  for(const [name,c]of Object.entries(workflow.connections)){
    assert.ok(names.has(name));for(const port of c.main)for(const target of port)assert.ok(names.has(target.node));
  }
  const webhook=workflow.nodes.find(n=>n.type==='n8n-nodes-base.webhook');
  assert.equal(webhook.parameters.authentication,'headerAuth');
  assert.equal(webhook.parameters.responseMode,'responseNode');
  assert.ok(!JSON.stringify(workflow).match(/sk-ant-|sk-proj-/));
  for(const n of workflow.nodes.filter(n=>n.type==='n8n-nodes-base.httpRequest'))assert.ok(n.credentials.httpHeaderAuth.name);
});
test('Every seed author passes payload validation and no phone or email reaches model facts',async()=>{
  for(const author of dataset.authors){const p=payload();p.body.author=author;p.body.author_id=author.author_id;const job=await run('Validate & summarise',p);assert.equal(job.valid,true);assert.equal(job.summary.email,undefined);assert.equal(job.summary.phone,undefined);}
});
test('Invalid author, duplicate books, negative figures, stale dates and inconsistent balances rejected',async()=>{
  for(const mutate of [p=>p.body.author_id='AUTH999',p=>p.body.request_id='../another-log',p=>p.body.author.books.push(p.body.author.books[0]),p=>p.body.author.books[0].royalty_paid=-1,p=>p.body.as_of='2020-01-01',p=>p.body.author.books[0].royalty_pending=123]){
    const p=payload();mutate(p);const r=await run('Validate & summarise',p);assert.equal(r.valid,false);assert.equal(r.http_code,400);
  }
});
test('Durable log preflight checks ownership, blocks completed/in-flight jobs and handles outages',async()=>{
  const job=await run('Validate & summarise',payload());const upstream={'Validate & summarise':job};
  const check=status=>run('Verify log & duplicates',{statusCode:200,body:{response:{_id:job.request_id,author_external_id:job.author_id,status}}},upstream);
  assert.equal((await check('Queued')).run,true);assert.equal((await check('Success')).reply.duplicate,true);assert.equal((await check('Processing')).http_code,409);
  assert.equal((await run('Verify log & duplicates',{statusCode:200,body:{response:{_id:job.request_id,author_external_id:'AUTH999',status:'Queued'}}},upstream)).http_code,403);
  assert.equal((await run('Verify log & duplicates',{error:'network failure'},upstream)).http_code,503);
});
test('Failure to record Processing prevents AI request',async()=>{
  const job=await run('Validate & summarise',payload());
  const failed=await run('Build AI request',{error:'unreachable'},{'Verify log & duplicates':job});
  assert.equal(failed.process_ok,false);assert.equal(failed.callback.status,'Failed');assert.equal(failed.llm_request,undefined);
});
test('AI request contains bounded context and data is treated as untrusted',async()=>{
  const job=await run('Validate & summarise',payload());
  const r=await run('Build AI request',{statusCode:204},{'Verify log & duplicates':job});
  assert.equal(r.process_ok,true);assert.equal(r.llm_request.max_tokens,500);assert.match(r.llm_request.messages[0].content,/untrusted/);
  assert.doesNotMatch(JSON.stringify(r.llm_request),/phone|email.com|98765/);
});
test('AI success composes exact amounts; malformed content and outages become Failed',async()=>{
  const job=await run('Validate & summarise',payload());const up={'Build AI request':job};
  const response=prose=>({statusCode:200,body:{choices:[{message:{content:JSON.stringify(prose)}}]}});
  const prose={subject:'Your BookLeaf royalty overview',greeting:'Hi Priya,',introduction:'Here is an overview of your publishing journey.',closing:'Please contact our team with any questions.'};
  const valid=await run('Validate output & compose email',response(prose),up);
  assert.equal(valid.callback.status,'Success');assert.equal(valid.callback.delivery_status,'Generated only');assert.match(valid.callback.email_body,/19,908.00/);
  for(const bad of [{error:'timeout'},{statusCode:429},response({...prose,introduction:'We will pay ₹999 tomorrow.'}),response({subject:'Missing fields'}),{statusCode:200,body:{choices:[{message:{content:'not json'}}]}}]){
    const r=await run('Validate output & compose email',bad,up);assert.equal(r.callback.status,'Failed');assert.equal(r.callback.email_body,undefined);
  }
});
test('Callback failure creates an explicit failed execution',async()=>{
  assert.equal((await run('Confirm callback',{statusCode:204})).callback_confirmed,true);
  await assert.rejects(()=>run('Confirm callback',{error:'network failure'}),/callback failed/);
});
