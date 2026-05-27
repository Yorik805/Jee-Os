window.JEEOS = window.JEEOS || {};
let actChart=null;
function renderActivityChart(db){
  if(typeof Chart==='undefined')return;
  const labels=[];const data=[];
  for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=d.toISOString().slice(0,10);labels.push(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]);data.push(db.sessions.filter(s=>s.date===key).reduce((a,s)=>a+JEEOS.utils.safeNumber(s.done),0));}
  const canvas=document.getElementById('actChart');if(!canvas)return;
  if(actChart)actChart.destroy();
  actChart=new Chart(canvas,{type:'bar',data:{labels,datasets:[{data,backgroundColor:'rgba(108,99,255,.6)',borderRadius:4,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6b7280'}},y:{grid:{color:'rgba(255,255,255,.04)'},ticks:{color:'#6b7280'}}}}});
}
JEEOS.charts={renderActivityChart};
