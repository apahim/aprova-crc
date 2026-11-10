import {loadQuestionIndex} from './content';

export type SessionProgress={done:boolean;best:number;total:number;attempts:number;lastAt:number;bestTotal?:number};
export type AttemptResult={id:string;src?:string;correct:boolean};
export type ProgressStore={last:number|null;sessions:Record<string,SessionProgress>;missed:Record<string,number>};

const KEY='aprova-crc:progress:v2';
const LEGACY_KEY='aprova-crc:progress:v1';

const empty=():ProgressStore=>({last:null,sessions:{},missed:{}});

function parseStore(raw:string):ProgressStore{
  const parsed=JSON.parse(raw)as Partial<ProgressStore>;
  const ok=parsed&&typeof parsed==='object';
  const sessions=ok&&parsed.sessions&&typeof parsed.sessions==='object'?parsed.sessions:{};
  const last=ok&&typeof parsed.last==='number'?parsed.last:null;
  const missedRaw=ok&&parsed.missed&&typeof parsed.missed==='object'?parsed.missed:{};
  const missed:Record<string,number>={};
  for(const [k,v] of Object.entries(missedRaw))if(typeof v==='number')missed[k]=v;
  return{last,sessions,missed};
}

const safeParse=(raw:string|null):ProgressStore|null=>{if(!raw)return null;try{return parseStore(raw)}catch{return null}};

export function loadProgress():ProgressStore{
  try{
    const cur=safeParse(localStorage.getItem(KEY));
    const leg=safeParse(localStorage.getItem(LEGACY_KEY));
    // v2 vence por chave; mescla defensiva se ambas existirem (migração anterior interrompida)
    if(cur&&leg)return{last:cur.last??leg.last,sessions:{...leg.sessions,...cur.sessions},missed:{...leg.missed,...cur.missed}};
    return cur??leg??empty();
  }catch{return empty()}
}

export function saveProgress(store:ProgressStore):boolean{
  try{localStorage.setItem(KEY,JSON.stringify(store));return true}catch{return false}
}

function write(store:ProgressStore):ProgressStore{saveProgress(store);return store}

export function resetProgress():void{try{localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY)}catch{/* unavailable */}}

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
  for(const r of results){
    if(r.correct){delete missed[r.id];if(r.src)delete missed[r.src]} // src limpa eventual gêmeo posicional legado
    else missed[r.id]=(missed[r.id]||0)+1;
  }
  return write({last:store.last,sessions,missed});
}

/** O banco de erros ainda tem chaves posicionais antigas (pré-v2)? */
export const hasLegacyIds=(store:ProgressStore):boolean=>Object.keys(store.missed).some(id=>!id.startsWith('q:'));

/**
 * Migração v1→v2: converte chaves posicionais ("s:26:3") em ids estáveis ("q:…") resolvendo-as no
 * índice de questões; chaves órfãs (questão inexistente) são descartadas. Grava v2 e remove v1.
 * Recebe um getter para ler o estado mais recente depois do await do índice.
 */
export async function translateProgress(get:()=>ProgressStore):Promise<ProgressStore>{
  const initial=get();
  if(!hasLegacyIds(initial)){
    try{
      if(localStorage.getItem(LEGACY_KEY)!=null){write(initial);localStorage.removeItem(LEGACY_KEY)}
    }catch{}
    return initial;
  }
  const {byId,bySrc}=await loadQuestionIndex();
  const store=get();
  const missed:Record<string,number>={};
  for(const [id,n] of Object.entries(store.missed)){
    const it=id.startsWith('q:')?byId.get(id):bySrc.get(id);
    if(it)missed[it.id]=(missed[it.id]||0)+n;
  }
  const next:ProgressStore={last:store.last,sessions:store.sessions,missed};
  write(next);
  try{localStorage.removeItem(LEGACY_KEY)}catch{}
  return next;
}
