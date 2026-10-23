const job=$('Build AI request').first().json;
const response=$input.first().json;
const callback={status:'Failed',completed_at:new Date().toISOString(),error_message:'AI provider failed or returned invalid content. No email was sent.',delivery_status:'Not sent'};
try{
  if(response.statusCode!==200)throw new Error('Provider failure');
  const text=response.body?.choices?.[0]?.message?.content;
  if(typeof text!=='string'||text.length>10000)throw new Error('Missing content');
  const prose=JSON.parse(text);
  for(const key of ['subject','greeting','introduction','closing'])if(typeof prose[key]!=='string'||!prose[key].trim()||prose[key].length>2000)throw new Error('Invalid response field');
  if(prose.subject.length>160||/[\r\n]/.test(prose.subject))throw new Error('Invalid email subject');
  // Arithmetic and payout windows are rendered from validated facts, not model arithmetic.
  if(/[0-9₹$€£]/.test([prose.greeting,prose.introduction,prose.closing].join(' ')))throw new Error('Model added unverified numeric claims');
  Object.assign(callback,{status:'Success',subject:prose.subject,email_body:deterministicBody(job.summary,prose),error_message:'',delivery_status:'Generated only',total_earned:job.summary.totals.earned,total_paid:job.summary.totals.paid,total_pending:job.summary.totals.pending,generated_at:new Date().toISOString()});
}catch{}
return [{json:{...job,callback}}];
