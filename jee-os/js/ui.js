window.JEEOS = window.JEEOS || {};
function toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function openModal(){document.getElementById('ch-modal')?.classList.add('open');}
function closeModal(){document.getElementById('ch-modal')?.classList.remove('open');}
function rowEmpty(msg,col=7){return `<tr><td colspan="${col}" style="color:var(--muted)">${msg}</td></tr>`;}
JEEOS.ui={toast,openModal,closeModal,rowEmpty};
