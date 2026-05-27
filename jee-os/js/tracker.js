window.JEEOS = window.JEEOS || {};
function updateLogChapterDropdown(db){const sub=document.getElementById('log-sub').value;const sel=document.getElementById('log-ch');const chs=db.chapters[sub]||[];sel.innerHTML=chs.length?chs.map(c=>`<option>${c.name}</option>`).join(''):'<option>-- add chapters first --</option>';}
function parseDoubts(text,start,end){
  if(!text.trim())return [];
  return [...new Set(text.split(',').map(x=>Number(x.trim())).filter(n=>Number.isInteger(n) && n>=start && n<=end))];
}
function logSession(db){
  const sub=document.getElementById('log-sub').value;const chapter=document.getElementById('log-ch').value;const type=document.getElementById('log-type').value;
  const start=JEEOS.utils.safeNumber(document.getElementById('log-range-start').value);const end=JEEOS.utils.safeNumber(document.getElementById('log-range-end').value);
  const done=JEEOS.utils.safeNumber(document.getElementById('log-done').value);
  const doubts=parseDoubts(document.getElementById('log-doubts').value,start,end);
  const flag=document.getElementById('log-flag').value==='1';const notes=document.getElementById('log-notes').value.trim();
  if(!chapter||chapter.includes('add chapters'))return {ok:false,msg:'Please add chapters first'};
  if(start<1||end<start)return {ok:false,msg:'Invalid range'};
  const attempted=end-start+1;
  if(done<=0 || done>attempted)return {ok:false,msg:'Solved count should be within range size'};
  const left=Math.max(0,attempted-done);
  const correct=Math.max(0,done-doubts.length);
  const sess={date:JEEOS.utils.today(),subject:sub,chapter,type,rangeStart:start,rangeEnd:end,attempted,done,correct,left,doubts,flag:flag||doubts.length>0,notes};
  db.sessions.push(sess);
  const ch=db.chapters[sub].find(c=>c.name===chapter);
  if(ch){
    if(type==='Exercise')ch.exDone=JEEOS.utils.clamp(ch.exDone+done,0,ch.exTotal||ch.exDone+done);
    if(type==='Step 2')ch.s2Done=JEEOS.utils.clamp(ch.s2Done+done,0,ch.s2Total||ch.s2Done+done);
    if(type==='Step 3')ch.s3Done=JEEOS.utils.clamp(ch.s3Done+done,0,ch.s3Total||ch.s3Done+done);
    ch.lastTouched=JEEOS.utils.today();
    ch.doubtQuestions=[...(ch.doubtQuestions||[]),...doubts];
    if(sess.flag)ch.revisionCount=(ch.revisionCount||0)+1;
  }
  ['log-range-start','log-range-end','log-done','log-doubts','log-notes'].forEach(id=>document.getElementById(id).value='');document.getElementById('log-flag').value='0';
  return {ok:true};
}
function renderSessionHistory(db){
  const tbody=document.getElementById('log-body');
  if(!db.sessions.length){tbody.innerHTML=JEEOS.ui.rowEmpty('No progress logged yet.',9);return;}
  tbody.innerHTML=db.sessions.slice().reverse().map(s=>{const tag=s.subject==='Physics'?'tag-p':s.subject==='Chemistry'?'tag-c':'tag-m';const range=`${s.rangeStart||'-'}-${s.rangeEnd||'-'}`;const doubts=(s.doubts||[]).length?(s.doubts||[]).join(','):'-';return `<tr><td>${s.date}</td><td><span class="tag ${tag}">${s.subject.slice(0,4).toUpperCase()}</span></td><td>${s.chapter}</td><td>${s.type}</td><td>${range}</td><td>${s.done}</td><td>${s.left ?? '-'}</td><td>${doubts}</td><td>${s.flag?'[REV] ':''}${s.notes||'-'}</td></tr>`;}).join('');
}
JEEOS.tracker={logSession,renderSessionHistory,updateLogChapterDropdown};
