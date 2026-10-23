import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile}from'node:fs/promises';
import {isoDate,royaltyStatus,nextQuarterWindow,summariseAuthor,deterministicBody}from'../scripts/royalty.mjs';
const data=JSON.parse(await readFile(new URL('../data/bookleaf_sample_data.json',import.meta.url),'utf8'));
const base={status:'Published & Live',royalty_pending:2000,publication_date:'2026-01-01',last_royalty_payout_date:'2026-01-01'};
test('Source dataset preserved: 10 authors and 18 books',()=>{
  assert.equal(data.authors.length,10);assert.equal(data.authors.flatMap(a=>a.books).length,18);
  for(const a of data.authors){const s=summariseAuthor(a,'2026-10-21');assert.ok(Math.abs(s.totals.earned-s.totals.paid-s.totals.pending)<.01);}
});
test('Paid, pending, 90-day boundary and overdue indicators',()=>{
  assert.equal(royaltyStatus({...base,royalty_pending:0},'2026-10-21'),'Fully paid');
  assert.equal(royaltyStatus(base,'2026-04-01'),'Pending');
  assert.equal(royaltyStatus(base,'2026-04-02'),'Overdue');
  assert.equal(royaltyStatus({...base,last_royalty_payout_date:null},'2026-04-02'),'Overdue');
  assert.equal(royaltyStatus({...base,status:'Typesetting'},'2026-10-21'),'Pending');
});
test('Calendar dates and leap-year rollover are exact',()=>{
  assert.throws(()=>isoDate('2026-02-30'));
  assert.throws(()=>isoDate('21/10/2026'));
  assert.equal(isoDate('2024-02-29').toISOString().slice(0,10),'2024-02-29');
  assert.deepEqual(nextQuarterWindow('2026-10-21'),{quarter_end:'2026-09-30',payout_deadline:'2026-11-14'});
  assert.deepEqual(nextQuarterWindow('2026-11-15'),{quarter_end:'2026-12-31',payout_deadline:'2027-02-14'});
  assert.deepEqual(nextQuarterWindow('2026-01-01'),{quarter_end:'2025-12-31',payout_deadline:'2026-02-14'});
});
test('Known author totals are calculated from source values',()=>{
  const s=summariseAuthor(data.authors[0],'2026-10-21');
  assert.deepEqual(s.totals,{earned:19908,paid:16338,pending:3570,copies_sold:531});
});
test('Email covers financial figures without inventing payment commitments',()=>{
  const s=summariseAuthor(data.authors[0],'2026-10-21');
  const body=deterministicBody(s,{greeting:'Hi Priya,',introduction:'Here is your royalty overview.',closing:'Please contact our team with any questions.'});
  assert.match(body,/Whispers of the Ganges/);assert.match(body,/19,908.00/);assert.match(body,/16,338.00/);assert.match(body,/3,570.00/);assert.match(body,/not a confirmed payment date/);assert.match(body,/90-day rule/);
});
test('Below-threshold, fully paid and production-only authors',()=>{
  const prose={greeting:'Hello,',introduction:'Your royalty summary follows.',closing:'Contact our team.'};
  const a={author_id:'AUTH999',name:'Test Author',books:[{...base,title:'Test',total_copies_sold:1,total_royalty_earned:500,royalty_paid:0,royalty_pending:500}]};
  assert.match(deterministicBody(summariseAuthor(a,'2026-10-21'),prose),/below the ₹1,000/);
  a.books[0]={...a.books[0],total_royalty_earned:0,royalty_pending:0,status:'Typesetting'};
  const b=deterministicBody(summariseAuthor(a,'2026-10-21'),prose);
  assert.match(b,/do not have any published books/);assert.match(b,/All royalties in this snapshot are paid up/);assert.match(b,/Test: Typesetting/);
});
