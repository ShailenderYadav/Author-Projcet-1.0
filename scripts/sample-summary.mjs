import{readFile,writeFile}from'node:fs/promises';
import{summariseAuthor,deterministicBody}from'./royalty.mjs';
const root=new URL('../',import.meta.url);
const data=JSON.parse(await readFile(new URL('data/bookleaf_sample_data.json',root),'utf8'));
const summary=summariseAuthor(data.authors[0],new Date().toISOString().slice(0,10));
const body=deterministicBody(summary,{greeting:`Hi ${summary.name.split(' ')[0]},`,introduction:'Here is your BookLeaf royalty snapshot and the status of your books.',closing:'If you have questions about these figures, please contact the BookLeaf team so we can review them together.'});
await writeFile(new URL('examples/sample-summary.txt',root),'LOCAL FIXTURE — NOT AI-GENERATED, NOT SENT\n\nSubject: Your BookLeaf royalty overview\n\n'+body+'\n');
console.log('Wrote examples/sample-summary.txt (explicit local fixture; no AI call or email delivery).');
