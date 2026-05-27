window.JEEOS = window.JEEOS || {};
const STORAGE_KEY='jee_db';
function baseDb(){return {chapters:{Physics:[],Chemistry:[],Mathematics:[]},sessions:[],school:{Physics:{ch:'',idx:0,total:0},Chemistry:{ch:'',idx:0,total:0},Mathematics:{ch:'',idx:0,total:0}},goal:30};}
function normalizeChapter(ch){
  const u=JEEOS.utils;
  const exTotal=u.safeNumber(ch.exTotal),s2Total=u.safeNumber(ch.s2Total),s3Total=u.safeNumber(ch.s3Total);
  const exDone=u.clamp(u.safeNumber(ch.exDone),0,Math.max(exTotal,0));
  const s2Done=u.clamp(u.safeNumber(ch.s2Done),0,Math.max(s2Total,0));
  const s3Done=u.clamp(u.safeNumber(ch.s3Done),0,Math.max(s3Total,0));
  return {name:(ch.name||'Untitled').trim(),notes:(ch.notes||'').trim(),exTotal,s2Total,s3Total,exDone,s2Done,s3Done,lastTouched:ch.lastTouched||null,revisionCount:u.safeNumber(ch.revisionCount),accuracy:u.safeNumber(ch.accuracy),mastery:ch.mastery||'WEAK',createdAt:ch.createdAt||JEEOS.utils.today()};
}
function normalizeDb(db){
  const d={...baseDb(),...(db||{})};
  JEEOS.SUBJECTS.forEach(s=>{d.chapters[s]=(d.chapters[s]||[]).map(normalizeChapter);d.school[s]=d.school[s]||{ch:'',idx:0,total:0};});
  d.sessions=(d.sessions||[]).map(s=>({
    date:s.date||JEEOS.utils.today(),
    subject:s.subject||'Physics',
    chapter:s.chapter||'',
    type:s.type||'Exercise',
    rangeStart:JEEOS.utils.safeNumber(s.rangeStart),
    rangeEnd:JEEOS.utils.safeNumber(s.rangeEnd),
    attempted:JEEOS.utils.safeNumber(s.attempted),
    done:JEEOS.utils.safeNumber(s.done),
    left:JEEOS.utils.safeNumber(s.left),
    correct:JEEOS.utils.safeNumber(s.correct),
    doubts:Array.isArray(s.doubts)?s.doubts:[],
    flag:!!s.flag,
    notes:s.notes||''
  }));
  d.goal=JEEOS.utils.safeNumber(d.goal,30);
  return d;
}
function loadDatabase(){try{return normalizeDb(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null'));}catch{return baseDb();}}
function saveDatabase(db){localStorage.setItem(STORAGE_KEY,JSON.stringify(normalizeDb(db)));}
function exportData(db){
  const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='jee_data.json';a.click();
}
function importData(file,onDone,onErr){
  const r=new FileReader();
  r.onload=e=>{try{onDone(normalizeDb(JSON.parse(e.target.result)));}catch{onErr('Invalid JSON file');}};
  r.readAsText(file);
}
function resetData(){return baseDb();}
JEEOS.storage={loadDatabase,saveDatabase,exportData,importData,resetData,normalizeDb};
