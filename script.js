
let db = JSON.parse(localStorage.getItem('jee_db') || 'null') || {
  chapters:{Physics:[],Chemistry:[],Mathematics:[]},
  sessions:[],
  school:{Physics:{ch:'',idx:0,total:0},Chemistry:{ch:'',idx:0,total:0},Mathematics:{ch:'',idx:0,total:0}},
  streak:{days:[],last:''},
  goal:30
};
let editingSubject=null,editingIdx=-1;
let actChart=null;

function save(){localStorage.setItem('jee_db',JSON.stringify(db));}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}

function nav(page,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  el.classList.add('active');
  if(page==='overview')renderOverview();
  if(page==='physics')renderSubjectPage('Physics');
  if(page==='chemistry')renderSubjectPage('Chemistry');
  if(page==='math')renderSubjectPage('Mathematics');
  if(page==='school')renderSchool();
  if(page==='tracker')renderLog();
}

function getColor(sub){return sub==='Physics'?'#9c95ff':sub==='Chemistry'?'#00d9a3':'#ff8080';}

function chapterCompletion(ch){
  const exT=+ch.exTotal||0,s2T=+ch.s2Total||0,s3T=+ch.s3Total||0;
  const exD=+ch.exDone||0,s2D=+ch.s2Done||0,s3D=+ch.s3Done||0;
  const tot=exT+s2T+s3T;
  const done=exD+s2D+s3D;
  return tot===0?0:Math.round((done/tot)*100);
}

function renderOverview(){
  let totDone=0,totTotal=0;
  ['Physics','Chemistry','Mathematics'].forEach(sub=>{
    const chs=db.chapters[sub];
    let subDone=0,subTot=0;
    chs.forEach(ch=>{subDone+=(+ch.exDone||0)+(+ch.s2Done||0)+(+ch.s3Done||0);subTot+=(+ch.exTotal||0)+(+ch.s2Total||0)+(+ch.s3Total||0);});
    totDone+=subDone;totTotal+=subTot;
    const pct=subTot===0?0:Math.round((subDone/subTot)*100);
    const key=sub==='Physics'?'phy':sub==='Chemistry'?'chem':'math';
    const bar=document.getElementById('ov-'+key+'-bar');
    if(bar)bar.style.width=pct+'%';
    const txt=document.getElementById('ov-'+key+'-txt');
    const touched=chs.filter(c=>chapterCompletion(c)>0).length;
    if(txt)txt.textContent=touched+' / '+chs.length+' chapters touched · '+pct+'%';
  });
  document.getElementById('ov-total').textContent=db.sessions.reduce((a,s)=>a+(+s.done||0),0);
  const today=new Date().toISOString().slice(0,10);
  const todaySess=db.sessions.filter(s=>s.date===today).reduce((a,s)=>a+(+s.done||0),0);
  document.getElementById('ov-today').textContent=todaySess;
  document.getElementById('ov-pct').textContent=(totTotal===0?0:Math.round((totDone/totTotal)*100))+'%';
  document.getElementById('ov-streak').textContent=calcStreak();
  renderActivityChart();
  renderFlags();
}

function calcStreak(){
  const days=new Set(db.sessions.map(s=>s.date));
  let streak=0;
  let d=new Date();
  while(true){
    const key=d.toISOString().slice(0,10);
    if(days.has(key)){streak++;d.setDate(d.getDate()-1);}else break;
  }
  return streak;
}

function renderActivityChart(){
  const labels=[],data=[];
  for(let i=6;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const key=d.toISOString().slice(0,10);
    labels.push(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]);
    data.push(db.sessions.filter(s=>s.date===key).reduce((a,s)=>a+(+s.done||0),0));
  }
  if(actChart)actChart.destroy();
  actChart=new Chart(document.getElementById('actChart'),{type:'bar',data:{labels,datasets:[{label:'Questions',data,backgroundColor:'rgba(108,99,255,.6)',borderRadius:4,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6b7280'}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6b7280',stepSize:5}}}}});
}

function renderFlags(){
  const flags=db.sessions.filter(s=>s.flag);
  const c=document.getElementById('flag-count');
  c.textContent=flags.length?'('+flags.length+')':'';
  const el=document.getElementById('flag-list');
  if(!flags.length){el.innerHTML='<div style="color:var(--muted);font-size:13px">No flagged questions yet.</div>';return;}
  el.innerHTML=flags.slice(-5).reverse().map(s=>`<div style="padding:10px 0;border-bottom:1px solid rgba(42,45,58,.5)"><div class="flex-between"><span style="font-size:13px;font-weight:600">${s.subject} · ${s.chapter}</span><span class="tag tag-warn">${s.type}</span></div><div style="font-size:12px;color:var(--muted);margin-top:3px">${s.notes||'No notes'} · ${s.date}</div></div>`).join('');
}

function renderSubjectPage(sub){
  const key=sub==='Physics'?'phy':sub==='Chemistry'?'chem':'math';
  const chs=db.chapters[sub];
  const pageId='page-'+(sub==='Mathematics'?'math':sub.toLowerCase());
  const container=document.getElementById(sub==='Physics'?'phy-chapters':sub==='Chemistry'?'chem-chapters':'math-chapters');
  document.getElementById(key+'-total-ch').textContent=chs.length;
  const avgPct=chs.length===0?0:Math.round(chs.reduce((a,c)=>a+chapterCompletion(c),0)/chs.length);
  document.getElementById(key+'-avg').textContent=avgPct+'%';
  if(!chs.length){container.innerHTML='<div style="color:var(--muted);font-size:13px;padding:8px 0">No chapters added yet. Click "Add Chapter" to begin.</div>';return;}
  const color=getColor(sub);
  container.innerHTML=chs.map((ch,i)=>{
    const pct=chapterCompletion(ch);
    const exT=+ch.exTotal||0,s2T=+ch.s2Total||0,s3T=+ch.s3Total||0;
    const exD=+ch.exDone||0,s2D=+ch.s2Done||0,s3D=+ch.s3Done||0;
    const exPct=exT?Math.round((exD/exT)*100):0;
    const s2Pct=s2T?Math.round((s2D/s2T)*100):0;
    const s3Pct=s3T?Math.round((s3D/s3T)*100):0;
    const statusTag=pct===0?'tag-bad':pct<50?'tag-warn':'tag-good';
    const statusLabel=pct===0?'not started':pct<50?'in progress':'strong';
    return `<div class="chapter-row">
      <div>
        <div class="flex gap8 flex-between">
          <div class="ch-name">${ch.name}</div>
          <span class="tag ${statusTag}" style="font-size:10px">${pct}% · ${statusLabel}</span>
        </div>
        <div class="q-bars">
          <div class="q-bar-item"><div class="q-bar-label">Exercise ${exD}/${exT}</div><div class="q-bar-track"><div class="q-bar-fill" style="width:${exPct}%;background:#9c95ff"></div></div></div>
          <div class="q-bar-item"><div class="q-bar-label">Step 2 ${s2D}/${s2T}</div><div class="q-bar-track"><div class="q-bar-fill" style="width:${s2Pct}%;background:#00d9a3"></div></div></div>
          <div class="q-bar-item"><div class="q-bar-label">Step 3 ${s3D}/${s3T}</div><div class="q-bar-track"><div class="q-bar-fill" style="width:${s3Pct}%;background:#ffd166"></div></div></div>
        </div>
        ${ch.notes?`<div style="font-size:12px;color:var(--muted);margin-top:8px;padding:8px 10px;background:rgba(255,255,255,.03);border-radius:6px;border-left:2px solid ${color}">${ch.notes}</div>`:''}
      </div>
      <div class="flex" style="gap:6px;flex-shrink:0">
        <button class="btn btn-ghost btn-sm" onclick="openEditChapter('${sub}',${i})"><i class="ti ti-edit" aria-hidden="true"></i></button>
        <button class="btn btn-ghost btn-sm" style="border-color:#ff4444;color:#ff8080" onclick="deleteChapter('${sub}',${i})"><i class="ti ti-trash" aria-hidden="true"></i></button>
      </div>
    </div>`;
  }).join('');
}

function openAddChapter(sub){
  editingSubject=sub;editingIdx=-1;
  document.getElementById('modal-title').textContent='Add Chapter · '+sub;
  ['ch-name','ch-ex-total','ch-s2-total','ch-s3-total','ch-ex-done','ch-s2-done','ch-s3-done','ch-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ch-modal').classList.add('open');
}

function openEditChapter(sub,idx){
  editingSubject=sub;editingIdx=idx;
  const ch=db.chapters[sub][idx];
  document.getElementById('modal-title').textContent='Edit Chapter · '+sub;
  document.getElementById('ch-name').value=ch.name;
  document.getElementById('ch-ex-total').value=ch.exTotal||0;
  document.getElementById('ch-s2-total').value=ch.s2Total||0;
  document.getElementById('ch-s3-total').value=ch.s3Total||0;
  document.getElementById('ch-ex-done').value=ch.exDone||0;
  document.getElementById('ch-s2-done').value=ch.s2Done||0;
  document.getElementById('ch-s3-done').value=ch.s3Done||0;
  document.getElementById('ch-notes').value=ch.notes||'';
  document.getElementById('ch-modal').classList.add('open');
}

function saveChapter(){
  const name=document.getElementById('ch-name').value.trim();
  if(!name){toast('Chapter name required');return;}
  const ch={name,exTotal:+document.getElementById('ch-ex-total').value||0,s2Total:+document.getElementById('ch-s2-total').value||0,s3Total:+document.getElementById('ch-s3-total').value||0,exDone:+document.getElementById('ch-ex-done').value||0,s2Done:+document.getElementById('ch-s2-done').value||0,s3Done:+document.getElementById('ch-s3-done').value||0,notes:document.getElementById('ch-notes').value.trim()};
  if(editingIdx===-1)db.chapters[editingSubject].push(ch);
  else db.chapters[editingSubject][editingIdx]=ch;
  save();closeModal();
  renderSubjectPage(editingSubject);
  toast('Chapter saved!');
  updateLogChapterDropdown();
}

function deleteChapter(sub,idx){
  if(!confirm('Delete this chapter?'))return;
  db.chapters[sub].splice(idx,1);save();renderSubjectPage(sub);toast('Deleted');
}

function closeModal(){document.getElementById('ch-modal').classList.remove('open');}

document.getElementById('log-sub').addEventListener('change',updateLogChapterDropdown);
function updateLogChapterDropdown(){
  const sub=document.getElementById('log-sub').value;
  const sel=document.getElementById('log-ch');
  const chs=db.chapters[sub];
  sel.innerHTML=chs.length?chs.map(c=>`<option>${c.name}</option>`).join(''):'<option>— add chapters first —</option>';
}

function logSession(){
  const sub=document.getElementById('log-sub').value;
  const ch=document.getElementById('log-ch').value;
  const type=document.getElementById('log-type').value;
  const done=+document.getElementById('log-done').value||0;
  const correct=+document.getElementById('log-correct').value||0;
  const flag=document.getElementById('log-flag').value==='1';
  const notes=document.getElementById('log-notes').value.trim();
  if(!ch||ch==='— add chapters first —'){toast('Please add chapters first');return;}
  if(done===0){toast('Enter questions done');return;}
  const sess={date:new Date().toISOString().slice(0,10),subject:sub,chapter:ch,type,done,correct,flag,notes};
  db.sessions.push(sess);
  const chIdx=db.chapters[sub].findIndex(c=>c.name===ch);
  if(chIdx>=0){
    const chObj=db.chapters[sub][chIdx];
    if(type==='Exercise')chObj.exDone=Math.min((+chObj.exDone||0)+done,+chObj.exTotal||done);
    else if(type==='Step 2')chObj.s2Done=Math.min((+chObj.s2Done||0)+done,+chObj.s2Total||done);
    else chObj.s3Done=Math.min((+chObj.s3Done||0)+done,+chObj.s3Total||done);
  }
  save();renderLog();toast('Session logged!');
  ['log-done','log-correct','log-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('log-flag').value='0';
}

function renderLog(){
  const tbody=document.getElementById('log-body');
  if(!db.sessions.length){tbody.innerHTML='<tr><td colspan="8" style="color:var(--muted);padding:20px 12px">No sessions logged yet.</td></tr>';return;}
  tbody.innerHTML=db.sessions.slice().reverse().map((s,i)=>{
    const acc=s.done>0?Math.round((s.correct/s.done)*100):0;
    return `<tr>
      <td style="color:var(--muted)">${s.date}</td>
      <td><span class="tag ${s.subject==='Physics'?'tag-p':s.subject==='Chemistry'?'tag-c':'tag-m'}">${s.subject.slice(0,4).toUpperCase()}</span></td>
      <td style="font-weight:600">${s.chapter}</td>
      <td style="color:var(--muted)">${s.type}</td>
      <td style="font-weight:700">${s.done}</td>
      <td><span style="color:${acc>=70?'var(--accent2)':acc>=40?'var(--accent4)':'var(--accent3)'}">${s.correct}/${s.done} (${acc}%)</span></td>
      <td style="color:var(--muted);font-size:12px">${s.flag?'🔴 ':''}${s.notes||'—'}</td>
      <td></td>
    </tr>`;
  }).join('');
}

function renderSchool(){
  const container=document.getElementById('race-cards');
  const subs=['Physics','Chemistry','Mathematics'];
  container.innerHTML=subs.map(sub=>{
    const sc=db.school[sub];
    const chs=db.chapters[sub];
    const youPct=chs.length===0?0:Math.round(chs.reduce((a,c)=>a+chapterCompletion(c),0)/chs.length);
    const totalChs=chs.length||10;
    const schoolPct=sc.idx>0?Math.min(Math.round((sc.idx/totalChs)*100),100):0;
    const color=getColor(sub);
    const ahead=youPct>schoolPct;
    return `<div class="card" style="margin-bottom:14px">
      <div class="flex-between" style="margin-bottom:12px">
        <div style="font-size:15px;font-weight:700">${sub}</div>
        <span class="tag ${ahead?'tag-good':'tag-bad'}">${ahead?'You\'re ahead':'School ahead'}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:12px">
        <div><div class="stat-label">Your progress</div><div style="font-size:22px;font-weight:800;color:${color}">${youPct}%</div></div>
        <div><div class="stat-label">School at</div><div style="font-size:22px;font-weight:800;color:var(--accent4)">${sc.ch||'Not set'}</div></div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:4px;font-weight:700;letter-spacing:1px">YOU</div>
      <div class="race-bar" style="margin-bottom:8px"><div class="race-you" style="width:${youPct}%;background:${color}">${youPct>8?youPct+'%':''}</div>${sc.idx>0?`<div class="race-school" style="left:${schoolPct}%;height:32px"></div>`:''}</div>
      <div style="font-size:11px;color:var(--muted)">Yellow line = school position · ${sc.idx>0?'Chapter '+sc.idx+' of '+totalChs:'Not set'}</div>
    </div>`;
  }).join('');
}

function updateSchool(){
  const sub=document.getElementById('sch-sub').value;
  const ch=document.getElementById('sch-chapter').value.trim();
  const idx=+document.getElementById('sch-idx').value||0;
  if(!ch){toast('Enter chapter name');return;}
  db.school[sub]={ch,idx,total:db.chapters[sub].length||10};
  save();renderSchool();toast('School progress updated!');
}

function saveGoal(){
  db.goal=+document.getElementById('daily-goal').value||30;save();
}

function exportData(){
  const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='jee_data.json';a.click();
}

function importData(){
  const input=document.createElement('input');input.type='file';input.accept='.json';
  input.onchange=e=>{const r=new FileReader();r.onload=ev=>{try{db=JSON.parse(ev.target.result);save();toast('Data imported!');renderOverview();}catch(err){toast('Invalid JSON file');}};r.readAsText(e.target.files[0]);};
  input.click();
}

function resetData(){
  if(!confirm('Reset ALL data? This cannot be undone.'))return;
  db={chapters:{Physics:[],Chemistry:[],Mathematics:[]},sessions:[],school:{Physics:{ch:'',idx:0,total:0},Chemistry:{ch:'',idx:0,total:0},Mathematics:{ch:'',idx:0,total:0}},streak:{days:[],last:''},goal:30};
  save();renderOverview();toast('Data reset');
}

document.getElementById('daily-goal').value=db.goal||30;
updateLogChapterDropdown();
renderOverview();
