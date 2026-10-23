const input=$input.first().json;
const body=input.body;
try {
  if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Send one JSON object per author');
  const {request_id,author_id,author,as_of}=body;
  if(typeof request_id!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(request_id))throw new Error('request_id must be the Bubble NotificationLog unique ID');
  if(typeof author_id!=='string'||!/^AUTH\d{3,}$/.test(author_id)||author?.author_id!==author_id)throw new Error('Author identifier mismatch');
  if(typeof author.name!=='string'||!author.name.trim()||author.name.length>120)throw new Error('Author name is required');
  if(!Array.isArray(author.books)||author.books.length>100)throw new Error('Expected up to 100 linked books');
  isoDate(as_of);
  const today=new Date().toISOString().slice(0,10);
  if(as_of!==today)throw new Error('as_of must be the current UTC date; regenerate stale snapshots');
  const seen=new Set();
  const books=author.books.map(b=>{
    if(typeof b.book_id!=='string'||seen.has(b.book_id))throw new Error('Each book needs a unique identifier');
    seen.add(b.book_id);
    if(typeof b.title!=='string'||!b.title.trim()||b.title.length>300||typeof b.status!=='string'||b.status.length>100)throw new Error('Invalid book title or status');
    for(const key of ['total_copies_sold','total_royalty_earned','royalty_paid','royalty_pending']){
      if(typeof b[key]!=='number'||!Number.isFinite(b[key])||b[key]<0)throw new Error(`Invalid numeric field: ${key}`);
    }
    if(!Number.isInteger(b.total_copies_sold))throw new Error('Copies sold must be an integer');
    if(Math.abs(b.total_royalty_earned-b.royalty_paid-b.royalty_pending)>0.011)throw new Error('Earned royalties must equal paid plus pending');
    if(b.publication_date)isoDate(b.publication_date);
    if(b.last_royalty_payout_date)isoDate(b.last_royalty_payout_date);
    // Only facts needed for summaries reach the model; omit phone, contact and bank information.
    return {book_id:b.book_id,title:b.title,status:b.status,publication_date:b.publication_date||null,last_royalty_payout_date:b.last_royalty_payout_date||null,total_copies_sold:b.total_copies_sold,total_royalty_earned:b.total_royalty_earned,royalty_paid:b.royalty_paid,royalty_pending:b.royalty_pending};
  });
  const summary=summariseAuthor({author_id,name:author.name,books},as_of);
  const config={
    llm_url:'https://api.openai.com/v1/chat/completions',
    model:'gpt-4o-mini',
    bubble_api_base:'https://shailender12131.bubbleapps.io/version-test/api/1.1/obj',
    notification_type:'notificationlog'
  };
  return [{json:{valid:true,request_id,author_id,summary,config}}];
}catch(error){
  return [{json:{valid:false,http_code:400,reply:{accepted:false,error:error.message}}}];
}
