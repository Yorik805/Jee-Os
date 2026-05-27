window.JEEOS = window.JEEOS || {};
function getColor(s){return s==='Physics'?'#9c95ff':s==='Chemistry'?'#00d9a3':'#ff8080';}
function addChapterFromSettings(db){
  const u=JEEOS.utils;
  const subject=document.getElementById('set-ch-sub').value;
  const name=document.getElementById('set-ch-name').value.trim();
  if(!name)return {ok:false,msg:'Chapter name required'};
  const ch={
    name,
    exTotal:u.safeNumber(document.getElementById('set-ch-ex-total').value),
    s2Total:u.safeNumber(document.getElementById('set-ch-s2-total').value),
    s3Total:u.safeNumber(document.getElementById('set-ch-s3-total').value),
    exDone:0,s2Done:0,s3Done:0,
    notes:document.getElementById('set-ch-notes').value.trim(),
    createdAt:u.today(),
    lastTouched:null,
    revisionCount:0,
    doubtQuestions:[]
  };
  db.chapters[subject].push(ch);
  ['set-ch-name','set-ch-ex-total','set-ch-s2-total','set-ch-s3-total','set-ch-notes'].forEach(id=>document.getElementById(id).value='');
  return {ok:true,subject};
}
function deleteChapter(db,subject,idx){db.chapters[subject].splice(idx,1);}
function renderChapterCards(db,subject){
  const key=subject==='Physics'?'phy':subject==='Chemistry'?'chem':'math';
  const container=document.getElementById(`${key}-chapters`);
  const list=db.chapters[subject];
  document.getElementById(`${key}-total-ch`).textContent=list.length;
  const avg=list.length?Math.round(list.reduce((a,c)=>a+JEEOS.analytics.chapterCompletion(c),0)/list.length):0;
  document.getElementById(`${key}-avg`).textContent=`${avg}%`;
  if(!list.length){container.innerHTML='<div class="mini-sub">No chapters added yet. Add from Settings.</div>';return;}
  container.innerHTML=list.map((ch,i)=>{const m=JEEOS.analytics.calculateMasteryScore(db,subject,ch);const pct=JEEOS.analytics.chapterCompletion(ch);const exPct=JEEOS.utils.percentage(ch.exDone,ch.exTotal),s2Pct=JEEOS.utils.percentage(ch.s2Done,ch.s2Total),s3Pct=JEEOS.utils.percentage(ch.s3Done,ch.s3Total);const status=m.rating==='MASTERED'?'tag-good':m.rating==='GOOD'?'tag-warn':'tag-bad';return `<div class="chapter-row"><div><div class="subject-head"><div><strong>${ch.name}</strong></div><span class="tag ${status}">${m.rating} | ${pct}%</span></div><div class="q-bars"><div class="q-bar-item"><div class="q-bar-label">Exercise ${ch.exDone}/${ch.exTotal}</div><div class="q-bar-track"><div class="q-bar-fill" style="width:${exPct}%;background:#9c95ff"></div></div></div><div class="q-bar-item"><div class="q-bar-label">Step 2 ${ch.s2Done}/${ch.s2Total}</div><div class="q-bar-track"><div class="q-bar-fill" style="width:${s2Pct}%;background:#00d9a3"></div></div></div><div class="q-bar-item"><div class="q-bar-label">Step 3 ${ch.s3Done}/${ch.s3Total}</div><div class="q-bar-track"><div class="q-bar-fill" style="width:${s3Pct}%;background:#ffd166"></div></div></div></div>${ch.notes?`<div class="mini-sub" style="border-left:2px solid ${getColor(subject)};padding-left:8px;margin-top:8px;">${ch.notes}</div>`:''}</div><div class="flex"><button class="btn btn-ghost btn-sm" data-del-subject="${subject}" data-del-idx="${i}">Delete</button></div></div>`;}).join('');
}
function renderSubjectPage(db,subject){renderChapterCards(db,subject);}
JEEOS.subjects={addChapterFromSettings,deleteChapter,renderSubjectPage,renderChapterCards};
