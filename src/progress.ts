export type SessionProgress={done:boolean;best:number;total:number;attempts:number;lastAt:number;bestTotal?:number};
export type AttemptResult={id:string;correct:boolean};
export type ProgressStore={last:number|null;sessions:Record<string,SessionProgress>;missed:Record<string,number>};

const KEY='aprova-crc:progress:v1';

const empty=():ProgressStore=>({last:null,sessions:{},missed:{}});

export function loadProgress():ProgressStore{
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return empty();
    const parsed=JSON.parse(raw)as Partial<ProgressStore>;
    const ok=parsed&&typeof parsed==='object';
    const sessions=ok&&parsed.sessions&&typeof parsed.sessions==='object'?parsed.sessions:{};
    const last=ok&&typeof parsed.last==='number'?parsed.last:null;
    const missedRaw=ok&&parsed.missed&&typeof parsed.missed==='object'?parsed.missed:{};
    const missed:Record<string,number>={};
    for(const [k,v] of Object.entries(missedRaw))if(typeof v==='number')missed[k]=v;
    return{last,sessions,missed};
  }catch{return empty()}
}

export function saveProgress(store:ProgressStore):boolean{
  try{localStorage.setItem(KEY,JSON.stringify(store));return true}catch{return false}
}

export function resetProgress():void{try{localStorage.removeItem(KEY)}catch{/* unavailable */}}

function write(store:ProgressStore):ProgressStore{saveProgress(store);return store}

export function setLast(store:ProgressStore,sessionId:number):ProgressStore{
  if(store.last===sessionId)return store;
  return write({last:sessionId,sessions:store.sessions,missed:store.missed});
}

export function toggleDone(store:ProgressStore,sessionId:number):ProgressStore{
  const key=String(sessionId);
  const prev=store.sessions[key];
  return write({last:store.last,missed:store.missed,sessions:{...store.sessions,[key]:{done:!(prev?.done),best:prev?.best??0,total:prev?.total??0,attempts:prev?.attempts??0,lastAt:Date.now()}}});
}

export function applyAttempt(store:ProgressStore,sessionId:number|null,results:AttemptResult[],score:number,total:number):ProgressStore{
  let sessions=store.sessions;
  if(sessionId!=null){
    const key=String(sessionId);
    const prev=store.sessions[key];
    const better=score>(prev?.best??-1);
    sessions={...store.sessions,[key]:{done:true,best:better?score:(prev?.best??0),total,bestTotal:better?total:(prev?.bestTotal??prev?.total??total),attempts:(prev?.attempts??0)+1,lastAt:Date.now()}};
  }
  const missed={...store.missed};
  for(const r of results){if(r.correct)delete missed[r.id];else missed[r.id]=(missed[r.id]||0)+1}
  return write({last:store.last,sessions,missed});
}
