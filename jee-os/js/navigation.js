window.JEEOS = window.JEEOS || {};
function switchPage(page){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(`page-${page}`)?.classList.add('active');document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));if(JEEOS.app?.renderPage)JEEOS.app.renderPage(page);}
function bindNavigation(){document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>switchPage(btn.dataset.page)));}
JEEOS.navigation={switchPage,bindNavigation};
