const result=$input.first().json;
if(!Number.isInteger(result.statusCode)||result.statusCode<200||result.statusCode>=300){
  // Leave an explicit failed n8n execution; Bubble's stale-job check marks its log Failed.
  throw new Error('Bubble callback failed after retries. Check the credential and endpoint, then retry the same notification ID. No delivery is confirmed.');
}
return [{json:{callback_confirmed:true,completed_at:new Date().toISOString()}}];
