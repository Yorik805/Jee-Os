window.JEEOS = window.JEEOS || {};
JEEOS.SUBJECTS = ['Physics','Chemistry','Mathematics'];
JEEOS.utils = {
  formatDate(d){const dt=new Date(d);return Number.isNaN(dt.getTime())?'Invalid':dt.toISOString().slice(0,10);},
  clamp(v,min,max){return Math.min(max,Math.max(min,v));},
  percentage(a,b){return b>0?Math.round((a/b)*100):0;},
  safeNumber(v,fb=0){const n=Number(v);return Number.isFinite(n)?n:fb;},
  today(){return new Date().toISOString().slice(0,10);},
  daysBetween(a,b){return Math.floor((new Date(a)-new Date(b))/86400000);}
};
