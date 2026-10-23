export function isoDate(value) {
  if (!value) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Expected YYYY-MM-DD');
  const d = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0,10) !== value) throw new Error('Invalid calendar date');
  return d;
}
export const money = value => `₹${Number(value).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
export function royaltyStatus(book, asOf = new Date().toISOString().slice(0,10)) {
  const today = isoDate(asOf);
  if (Number(book.royalty_pending) <= 0) return 'Fully paid';
  if (book.status !== 'Published & Live') return 'Pending';
  const last = isoDate(book.last_royalty_payout_date);
  const published = isoDate(book.publication_date);
  const baseline = last || published;
  return baseline && (today-baseline)/86400000 > 90 ? 'Overdue' : 'Pending';
}
export function nextQuarterWindow(asOf) {
  const day=isoDate(asOf);
  const year=day.getUTCFullYear(),month=day.getUTCMonth();
  const quarter=Math.floor(month/3);
  const previousEnd=new Date(Date.UTC(year,quarter*3,0));
  const previousDeadline=new Date(previousEnd.getTime()+45*86400000);
  const end=day<=previousDeadline?previousEnd:new Date(Date.UTC(year,(quarter+1)*3,0));
  const deadline=new Date(end.getTime()+45*86400000);
  return {quarter_end:end.toISOString().slice(0,10),payout_deadline:deadline.toISOString().slice(0,10)};
}
export function summariseAuthor(author, asOf = new Date().toISOString().slice(0,10)) {
  isoDate(asOf);
  const books=author.books.map(b=>({...b,royalty_status:royaltyStatus(b,asOf)}));
  const total=key=>Math.round(books.reduce((n,b)=>n+Number(b[key]||0),0)*100)/100;
  const totals={earned:total('total_royalty_earned'),paid:total('royalty_paid'),pending:total('royalty_pending'),copies_sold:total('total_copies_sold')};
  return {author_id:author.author_id,name:author.name,email:author.email,city:author.city,as_of:asOf,books,totals,payout_status:books.some(b=>b.royalty_status==='Overdue')?'Overdue':totals.pending>0?'Pending':'Fully paid',payout_window:nextQuarterWindow(asOf)};
}
export function deterministicBody(summary, prose) {
  const lines=[prose.greeting,'',prose.introduction,'',`Royalty snapshot as of ${summary.as_of}`,''];
  for(const b of summary.books.filter(b=>b.status==='Published & Live')) lines.push(`${b.title}\nCopies sold: ${b.total_copies_sold}\nEarned: ${money(b.total_royalty_earned)} | Paid: ${money(b.royalty_paid)} | Pending: ${money(b.royalty_pending)}\nLast payout: ${b.last_royalty_payout_date||'No payout recorded'}\nStatus: ${b.royalty_status}\n`);
  if(!summary.books.some(b=>b.status==='Published & Live')) lines.push('You do not have any published books in this snapshot.','');
  lines.push(`Across all your books: earned ${money(summary.totals.earned)}, paid ${money(summary.totals.paid)}, pending ${money(summary.totals.pending)}.`,'');
  if(summary.totals.pending===0) lines.push('All royalties in this snapshot are paid up. Thank you for being part of BookLeaf.');
  else {
    lines.push('BookLeaf pays royalties quarterly, within 45 days after quarter end. The author receives 80% of net profit after printing costs, platform commission, and shipping.');
    if(summary.totals.pending<1000) lines.push('Your current pending balance is below the ₹1,000 minimum payout threshold and rolls over until eligible.');
    else lines.push(`The current policy window for eligible royalties is the quarter ending ${summary.payout_window.quarter_end}, payable within 45 days, by ${summary.payout_window.payout_deadline}. Your snapshot has no sales-period ledger or verified payment schedule, so this is a policy window, not a confirmed payment date.`);
    if(summary.payout_status==='Overdue') lines.push('At least one book is flagged for overdue review using the dashboard’s 90-day rule. This flag is separate from payout eligibility; our team needs to check the underlying royalty periods and payment records before confirming a resolution.');
  }
  const production=summary.books.filter(b=>b.status!=='Published & Live');
  if(production.length) lines.push('','Books in production:',...production.map(b=>`• ${b.title}: ${b.status}.`));
  lines.push('',prose.closing,'','Warm regards,','BookLeaf Publishing');
  return lines.join('\n');
}
