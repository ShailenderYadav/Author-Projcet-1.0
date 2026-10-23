const job=$('Validate & summarise').first().json;
const result=$input.first().json;
const log=result.body?.response||result.body;
if(result.statusCode!==200||!log||typeof log!=='object')return [{json:{run:false,http_code:503,reply:{accepted:false,request_id:job.request_id,error:'Unable to verify the Bubble notification log. No AI call was made.'}}}];
if(log.author_external_id!==job.author_id||log._id!==job.request_id)return [{json:{run:false,http_code:403,reply:{accepted:false,error:'Notification log does not match this author'}}}];
if(log.status==='Success')return [{json:{run:false,http_code:200,reply:{accepted:false,duplicate:true,request_id:job.request_id,status:'Success'}}}];
if(log.status==='Processing')return [{json:{run:false,http_code:409,reply:{accepted:false,duplicate:true,request_id:job.request_id,status:'Processing'}}}];
if(!['Queued','Failed'].includes(log.status))return [{json:{run:false,http_code:409,reply:{accepted:false,error:'Notification is not eligible for processing'}}}];
return [{json:{...job,run:true,http_code:202,reply:{accepted:true,request_id:job.request_id,status:'Queued'}}}];
