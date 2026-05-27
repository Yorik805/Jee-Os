window.JEEOS = window.JEEOS || {};
(function(){
  let db=JEEOS.storage.loadDatabase();
  function persist(){JEEOS.storage.saveDatabase(db);}
  function renderOverview(){
    const snap=JEEOS.analytics.getAnalyticsSnapshot(db);
    document.getElementById('ov-total').textContent=snap.totalQuestions;
    document.getElementById('ov-today').textContent=snap.today.done;
    document.getElementById('ov-streak').textContent=snap.streak;
    document.getElementById('ov-pct').textContent=`${snap.overallProgress}%`;
    JEEOS.SUBJECTS.forEach(sub=>{const key=sub==='Physics'?'phy':sub==='Chemistry'?'chem':'math';const chs=db.chapters[sub];const touched=chs.filter(ch=>JEEOS.analytics.chapterCompletion(ch)>0).length;const avg=chs.length?Math.round(chs.reduce((a,c)=>a+JEEOS.analytics.chapterCompletion(c),0)/chs.length):0;document.getElementById(`ov-${key}-bar`).style.width=`${avg}%`;document.getElementById(`ov-${key}-txt`).textContent=`${touched} / ${chs.length} chapters touched | ${avg}%`;});
    const goalDone=snap.today.done;const goalTotal=Math.max(1,JEEOS.utils.safeNumber(db.goal,30));const gp=JEEOS.utils.clamp(JEEOS.utils.percentage(goalDone,goalTotal),0,100);document.getElementById('goal-label').textContent=`${goalDone} / ${goalTotal}`;document.getElementById('goal-fill').style.width=`${gp}%`;const state=document.getElementById('goal-state');const done=goalDone>=goalTotal;state.textContent=done?'COMPLETED':'IN PROGRESS';state.className=`tag ${done?'tag-good':'tag-warn'}`;
    const queue=snap.revisionQueue;document.getElementById('flag-count').textContent=queue.length?`(${queue.length})`:'';const list=document.getElementById('flag-list');list.innerHTML=queue.length?queue.slice(0,8).map(x=>`<div><div class="subject-head"><strong>${x.subject} | ${x.chapter}</strong><span class="tag tag-bad">${x.mastery}</span></div><div class="mini-sub">Score ${x.score}% | Idle ${x.idle}d | Flags ${x.flags}</div></div>`).join(''):'<div class="mini-sub">No revision alerts right now.</div>';
    JEEOS.charts.renderActivityChart(db);
  }
  function renderPage(page){if(page==='overview')renderOverview();if(page==='tracker')JEEOS.tracker.renderSessionHistory(db);if(page==='school')JEEOS.school.renderSchool(db);if(page==='physics')JEEOS.subjects.renderSubjectPage(db,'Physics');if(page==='chemistry')JEEOS.subjects.renderSubjectPage(db,'Chemistry');if(page==='math')JEEOS.subjects.renderSubjectPage(db,'Mathematics');}
  function bindEvents(){
    JEEOS.navigation.bindNavigation();
    document.getElementById('log-sub').addEventListener('change',()=>JEEOS.tracker.updateLogChapterDropdown(db));
    document.getElementById('btn-log-session').addEventListener('click',()=>{const r=JEEOS.tracker.logSession(db);if(!r.ok)return JEEOS.ui.toast(r.msg);persist();JEEOS.tracker.renderSessionHistory(db);renderOverview();JEEOS.ui.toast('Progress logged!');});
    document.getElementById('btn-settings-add-ch').addEventListener('click',()=>{const r=JEEOS.subjects.addChapterFromSettings(db);if(!r.ok)return JEEOS.ui.toast(r.msg);persist();JEEOS.subjects.renderSubjectPage(db,r.subject);JEEOS.tracker.updateLogChapterDropdown(db);renderOverview();JEEOS.ui.toast('Chapter added!');});
    document.getElementById('btn-update-school').addEventListener('click',()=>{const r=JEEOS.school.updateSchool(db);if(!r.ok)return JEEOS.ui.toast(r.msg);persist();JEEOS.school.renderSchool(db);JEEOS.ui.toast('School progress updated!');});
    document.getElementById('daily-goal').addEventListener('change',e=>{db.goal=JEEOS.utils.safeNumber(e.target.value,30);persist();renderOverview();});
    document.getElementById('btn-export').addEventListener('click',()=>JEEOS.storage.exportData(db));
    document.getElementById('btn-import').addEventListener('click',()=>{const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=e=>JEEOS.storage.importData(e.target.files[0],next=>{db=next;persist();bootstrapRender();JEEOS.ui.toast('Data imported!');},msg=>JEEOS.ui.toast(msg));i.click();});
    document.getElementById('btn-reset').addEventListener('click',()=>{if(!confirm('Reset ALL data? This cannot be undone.'))return;db=JEEOS.storage.resetData();persist();bootstrapRender();JEEOS.ui.toast('Data reset');});
    document.body.addEventListener('click',e=>{const del=e.target.closest('[data-del-subject]');if(del&&confirm('Delete this chapter?')){JEEOS.subjects.deleteChapter(db,del.dataset.delSubject,Number(del.dataset.delIdx));persist();JEEOS.subjects.renderSubjectPage(db,del.dataset.delSubject);JEEOS.tracker.updateLogChapterDropdown(db);renderOverview();JEEOS.ui.toast('Deleted');}});
  }
  function bootstrapRender(){document.getElementById('daily-goal').value=db.goal||30;JEEOS.tracker.updateLogChapterDropdown(db);JEEOS.tracker.renderSessionHistory(db);JEEOS.subjects.renderSubjectPage(db,'Physics');JEEOS.subjects.renderSubjectPage(db,'Chemistry');JEEOS.subjects.renderSubjectPage(db,'Mathematics');JEEOS.school.renderSchool(db);renderOverview();}
  JEEOS.app={renderPage};bindEvents();bootstrapRender();
})();
