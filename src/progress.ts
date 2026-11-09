export type SessionProgress={done:boolean;best:number;total:number;attempts:number;lastAt:number};
export type ProgressStore={last:number|null;sessions:Record<string,SessionProgress>};

const KEY='aprova-crc:progress:v1';

const empty=():ProgressStore=>({last:null,sessions:{}});

export function loadProgress():ProgressStore{
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return empty();
    const parsed=JSON.parse(raw)as Partial<ProgressStore>;
    const sessions=parsed&&typeof parsed==='object'&&parsed.sessions&&typeof parsed.sessions==='object'?parsed.sessions:{};
    const last=typeof parsed?.last==='number'?parsed.last:null;
    return{last,sessions};
  }catch{return empty()}
}

export function saveProgress(store:ProgressStore):boolean{
  try{localStorage.setItem(KEY,JSON.stringify(store));return true}catch{return false}
}

export function resetProgress():void{try{localStorage.removeItem(KEY)}catch{/* unavailable */}}

function write(store:ProgressStore):ProgressStore{saveProgress(store);return store}

export function setLast(store:ProgressStore,sessionId:number):ProgressStore{
  if(store.last===sessionId)return store;
  return write({last:sessionId,sessions:store.sessions});
}

export function recordAttempt(store:ProgressStore,sessionId:number,score:number,total:number):ProgressStore{
  const key=String(sessionId);
  const prev=store.sessions[key];
  return write({last:store.last,sessions:{...store.sessions,[key]:{done:true,best:Math.max(score,prev?.best??0),total,attempts:(prev?.attempts??0)+1,lastAt:Date.now()}}});
}

export function toggleDone(store:ProgressStore,sessionId:number):ProgressStore{
  const key=String(sessionId);
  const prev=store.sessions[key];
  return write({last:store.last,sessions:{...store.sessions,[key]:{done:!(prev?.done),best:prev?.best??0,total:prev?.total??0,attempts:prev?.attempts??0,lastAt:Date.now()}}});
}
