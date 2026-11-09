import React,{useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BookOpen,CalendarDays,GraduationCap,ChevronLeft,ChevronRight,CheckCircle2,RotateCcw,Info,Timer,Moon,Sun} from 'lucide-react';
import curriculum from './curriculum.json';
import {demo,loadAllQuizzes,loadLesson,loadMini,loadQuizBank,loadQuizzes,loadSimulado,miniSessions,quizRange,resolveItems} from './content';
import type {Item,Lesson,Question,Session} from './content';
import {applyAttempt,loadProgress,resetProgress,setLast,toggleDone} from './progress';
import type {ProgressStore} from './progress';
import './style.css';

const kindLabel=(k:string)=>k==='aula'?'Aula':k==='revisao'?'Revisão':'Simulado';
const pad=(n:number)=>String(n).padStart(2,'0');

type Theme='light'|'dark';
const themeKey='aprova-crc:theme';
const readTheme=():Theme=>{try{const t=localStorage.getItem(themeKey);if(t==='light'||t==='dark')return t}catch{}return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'};
const applyTheme=(theme:Theme)=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem(themeKey,theme)}catch{}document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0e1411':'#11624f')};
const fmt=(s:number)=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
const simMap:Record<number,{letter:'A'|'B'|'C';from:number;to:number;label:string}>={
71:{letter:'A',from:0,to:25,label:'Simulado A · questões 1 a 25'},
72:{letter:'A',from:25,to:50,label:'Simulado A · questões 26 a 50'},
76:{letter:'B',from:0,to:25,label:'Simulado B · questões 1 a 25'},
77:{letter:'B',from:25,to:50,label:'Simulado B · questões 26 a 50'},
81:{letter:'C',from:0,to:25,label:'Simulado C · questões 1 a 25'},
82:{letter:'C',from:25,to:50,label:'Simulado C · questões 26 a 50'}};
const redoMap:Record<number,'A'|'B'|'C'>={73:'A',78:'B',83:'C'};
const reviewMap:Record<number,'A'|'B'|'C'>={74:'A',75:'A',79:'B',80:'B',84:'C',85:'C'};

const phases=[...new Set(curriculum.map(s=>s.block))].map(block=>{
  const weeks=[...new Set(curriculum.filter(s=>s.block===block).map(s=>s.week))];
  const total=curriculum.filter(s=>s.block===block).length;
  return{block,weeks,total};
});

type Route={page:'home'}|{page:'plan'}|{page:'lesson';id:number}|{page:'quiz';id:number}|{page:'review'};

function parseHash():Route{
  const h=window.location.hash;
  if(h==='#/plano')return{page:'plan'};
  if(h==='#/revisar')return{page:'review'};
  const m=h.match(/^#\/sessao\/(\d+)(\/quiz)?$/);
  if(m){
    const id=Number(m[1]);
    if(curriculum.some(s=>s.id===id))return m[2]?{page:'quiz',id}:{page:'lesson',id};
  }
  return{page:'home'};
}

type Quiz={sessionId:number|null;title:string;eyebrow:string;lead:string;list:Item[];simulado:boolean};

const tag=(key:(i:number)=>string,qs:Question[]):Item[]=>qs.map((q,i)=>({q,id:key(i)}));
function shuffle<T>(a:T[]):T[]{const c=[...a];for(let i=c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[c[i],c[j]]=[c[j],c[i]]}return c}

async function quizFor(s:Session,missedIds:string[]):Promise<Quiz>{
const m=simMap[s.id];
if(m){const bank=await loadSimulado(m.letter);return{sessionId:s.id,title:s.title,eyebrow:m.label.toUpperCase(),lead:'25 questões originais no formato do exame oficial (4 alternativas). Resolva sem consulta e cronometre: cerca de 3 minutos por questão.',list:tag(i=>'x:'+m.letter+':'+(m.from+i),bank.slice(m.from,m.to)),simulado:true}};
const redo=redoMap[s.id];
if(redo){const bank=await loadSimulado(redo);return{sessionId:s.id,title:s.title,eyebrow:('Refazer simulado '+redo).toUpperCase(),lead:'Refazer o simulado completo depois da correção ajuda a consolidar os pontos ajustados. 50 questões no formato do exame.',list:tag(i=>'x:'+redo+':'+i,bank),simulado:true}};
const rv=reviewMap[s.id];
if(rv){const miss=await resolveItems(missedIds.filter(id=>id.startsWith('x:'+rv+':')));
if(miss.length)return{sessionId:s.id,title:s.title,eyebrow:'REVISÃO DO SIMULADO '+rv,lead:'As questões que você errou no simulado '+rv+'. Acertar uma questão a remove da sua lista de erros.',list:miss,simulado:false}}
if(miniSessions.has(s.id)){const mini=await loadMini(s.id);
if(mini&&mini.length)return{sessionId:s.id,title:s.title,eyebrow:'MINI-SIMULADO',lead:'12 questões originais de '+s.block.toLowerCase()+' no formato do exame (4 alternativas). Cronometre e resolva sem consulta.',list:tag(i=>'m:'+s.id+':'+i,mini),simulado:true}}
if(s.kind==='aula'){const own=await loadQuizBank(s.id);
if(own&&own.length)return{sessionId:s.id,title:s.title,eyebrow:'PRÁTICA',lead:'Questões originais sobre '+s.title.toLowerCase()+', no formato do exame (4 alternativas).',list:tag(i=>'s:'+s.id+':'+i,own),simulado:false}}
if(s.kind==='revisao'){
const weekAulas=curriculum.filter(x=>x.week===s.week&&x.kind==='aula');
const weekIds=weekAulas.map(x=>x.id);
const weekSet=new Set(weekIds);
const weekMiss=(await resolveItems(missedIds.filter(id=>id.startsWith('s:')&&weekSet.has(Number(id.split(':')[1]))))).slice(0,12);
const files=await Promise.all([...new Set(weekIds.map(quizRange))].map(loadQuizzes));
const merged=Object.assign({},...files);
const agg=weekAulas.flatMap(x=>tag(i=>'s:'+x.id+':'+i,merged[String(x.id)]??[]));
const missIds=new Set(weekMiss.map(it=>it.id));
const fill=shuffle(agg.filter(it=>!missIds.has(it.id))).slice(0,Math.max(0,12-weekMiss.length));
const list=shuffle([...weekMiss,...fill]);
if(list.length)return{sessionId:s.id,title:s.title,eyebrow:'REVISÃO DA SEMANA',lead:'Prioridade para as questões que você errou nesta semana, com reforço de outras questões das aulas da semana.',list,simulado:false};
const all=await loadAllQuizzes();
const allItems=Object.entries(all).flatMap(([sid,qs])=>tag(i=>'s:'+sid+':'+i,qs));
if(allItems.length)return{sessionId:s.id,title:s.title,eyebrow:'REVISÃO GERAL',lead:'Seleção mista de questões de todo o curso para revisão.',list:shuffle(allItems).slice(0,10),simulado:false};
}
return{sessionId:s.id,title:'Teste seus conhecimentos',eyebrow:'PRÁTICA DEMONSTRATIVA',lead:'5 questões originais de fundamentos patrimoniais, no formato do exame (4 alternativas).',list:tag(i=>'d:'+i,demo),simulado:false};
}

function reviewQuiz(bank:Item[]):Quiz{return{sessionId:null,title:'Revisão de erros',eyebrow:'REVISÃO DE ERROS',lead:'Questões que você errou em quizzes e simulados. Acertar remove a questão da lista; errar mantém para a próxima revisão.',list:shuffle(bank),simulado:false}}

function QuizView({session,progress,setProgress,go,onPhase}:{session:Session|null;progress:ProgressStore;setProgress:(p:ProgressStore)=>void;go:(hash:string)=>void;onPhase:(active:boolean)=>void}){
const missed=Object.keys(progress.missed);
const build=():Promise<Quiz>=>session?quizFor(session,missed):resolveItems(missed).then(reviewQuiz);
const [quiz,setQuiz]=useState<Quiz|null>(null);
const [answers,setAnswers]=useState<Record<number,number>>({});
const [showResult,setShowResult]=useState(false);
const [seconds,setSeconds]=useState(0);
const [nonce,setNonce]=useState(0);
const [error,setError]=useState(false);
useLayoutEffect(()=>{
  let live=true;
  build().then(q=>{if(live){setQuiz(q);setAnswers({});setShowResult(false);setSeconds(0);setError(false)}},()=>{if(live)setError(true)});
  return()=>{live=false};
},[nonce]);
const score=quiz?quiz.list.filter((it,i)=>answers[i]===it.q.correct).length:0;
const answered=Object.keys(answers).length;
const budget=(quiz?.list.length??0)*180;
const over=seconds>budget;
const bankCount=Object.keys(progress.missed).length;
const entry=quiz&&quiz.sessionId!=null?progress.sessions[String(quiz.sessionId)]:undefined;
const areaStats=new Map<string,{ok:number;n:number}>();
quiz?.list.forEach((it,i)=>{const a=it.q.area??'Outros';const e=areaStats.get(a)??{ok:0,n:0};e.n++;if(answers[i]===it.q.correct)e.ok++;areaStats.set(a,e)});
const areas=[...areaStats.entries()].sort((x,y)=>y[1].n-x[1].n);
useEffect(()=>{onPhase(!showResult);return()=>onPhase(false)},[showResult]);
useEffect(()=>{if(!quiz?.simulado||showResult)return;const t=setInterval(()=>setSeconds(s=>s+1),1000);return()=>clearInterval(t)},[quiz,showResult]);
const submit=()=>{if(!quiz)return;const results=quiz.list.map((it,i)=>({id:it.id,correct:answers[i]===it.q.correct}));const sc=results.filter(r=>r.correct).length;setShowResult(true);setProgress(applyAttempt(progress,quiz.sessionId,results,sc,quiz.list.length));window.scrollTo(0,0)};
const retry=()=>{setQuiz(null);setShowResult(false);setNonce(n=>n+1);window.scrollTo(0,0)};
if(error)return <div className="panel"><h3>Não foi possível carregar as questões.</h3><p>Verifique sua conexão e tente novamente.</p><button className="primary" onClick={retry}><RotateCcw size={17}/> Tentar novamente</button></div>;
if(!quiz)return <div className="loading"><span className="spinner"/>Carregando questões…</div>;
return <><button className="back" onClick={()=>go(session?'#/sessao/'+session.id:'#/')}><ChevronLeft size={17}/> {session?'Voltar à aula':'Voltar ao início'}</button>
<div className="eyebrow">{quiz.eyebrow}</div><h1>{quiz.title}</h1><p className="lead">{quiz.lead}</p>
{quiz.list.length===0?<div className="panel"><h3>Nenhuma questão errada pendente.</h3><p>Você acertou tudo o que estava em revisão. Questões que errar daqui em diante aparecem aqui automaticamente.</p><button className="primary" onClick={()=>go('#/')}>Voltar ao início <ChevronRight size={18}/></button></div>
:<>{quiz.list.map((it,i)=><div className="panel question" key={it.id}><div className="eyebrow">QUESTÃO {pad(i+1)} DE {quiz.list.length}{it.q.area?` · ${it.q.area.toUpperCase()}`:''}</div><h3>{it.q.stem}</h3><div className="options">{it.q.options.map((opt,j)=><button disabled={showResult} className={'option '+(answers[i]===j?'chosen ':'')+(showResult&&it.q.correct===j?'correct ':'')+(showResult&&answers[i]===j&&j!==it.q.correct?'incorrect':'')} onClick={()=>setAnswers(a=>({...a,[i]:j}))} key={j}><span>{'ABCD'[j]}</span>{opt}</button>)}</div>{showResult&&<div className="explanation"><CheckCircle2 size={18}/><span>{it.q.explanation}</span></div>}</div>)}
{showResult?<div className="result"><b>{score}/{quiz.list.length} acertos</b><p>{Math.round(score/quiz.list.length*100)}% de aproveitamento nesta tentativa{quiz.simulado?' · no exame oficial a nota de corte é 25/50 (50%)':''}</p>{quiz.simulado&&<p className="muted">Tempo: {fmt(seconds)} de {fmt(budget)}.</p>}{entry&&entry.attempts>1&&<p className="muted">Melhor resultado: {entry.best}/{entry.total} em {entry.attempts} tentativas.</p>}{areas.length>1&&<div className="area-breakdown">{areas.map(([a,e])=><div className="area-row" key={a}><span className="area-name">{a}</span><span className="area-bar"><span style={{width:Math.round(e.ok/e.n*100)+'%'}}/></span><b className={e.ok/e.n<0.5?'weak':''}>{e.ok}/{e.n}</b></div>)}</div>}{bankCount>0&&<button className="review-link" onClick={()=>go('#/revisar')}><RotateCcw size={17}/> Revisar {bankCount} {bankCount===1?'questão errada':'questões erradas'}</button>}<button className="primary" onClick={retry}><RotateCcw size={17}/> Tentar novamente</button></div>
:<div className="quiz-bar">{quiz.simulado&&<b className={'timer'+(over?' over':'')}><Timer size={15}/>{over?'+':''}{fmt(over?seconds-budget:budget-seconds)}</b>}<span>{answered} de {quiz.list.length} respondidas</span><button className="primary" disabled={answered!==quiz.list.length} onClick={submit}>Corrigir respostas <CheckCircle2 size={18}/></button></div>}</>}
</>}

function LessonView({session,progress,setProgress,go,open,setWeek}:{session:Session;progress:ProgressStore;setProgress:(p:ProgressStore)=>void;go:(hash:string)=>void;open:(s:Session)=>void;setWeek:(w:number)=>void}){
const [lesson,setLesson]=useState<Lesson|undefined>(undefined);
const [ready,setReady]=useState(false);
const [count,setCount]=useState<number|null>(null);
useLayoutEffect(()=>{
  let live=true;
  setReady(false);setCount(null);
  loadLesson(session.id).then(l=>{if(live){setLesson(l);setReady(true)}},()=>{if(live)setReady(true)});
  quizFor(session,Object.keys(progress.missed)).then(q=>{if(live)setCount(q.list.length)},()=>{});
  return()=>{live=false};
},[session.id]);
const entry=progress.sessions[String(session.id)];
const objectives=lesson?.objectives?.length?lesson.objectives:[`Compreender os conceitos centrais de ${session.title.toLowerCase()}.`,'Identificar aplicações práticas e armadilhas comuns em questões objetivas.','Revisar o assunto e registrar dúvidas para estudo posterior.'];
const sections=lesson?.sections?.length?lesson.sections:[{h:'Introdução ao tema',p:[`Esta sessão apresenta o tema “${session.title}” dentro de ${session.block}. Consulte a norma e o material didático atualizados, identifique definições e classificações, resolva exemplos e verifique os critérios aplicáveis ao assunto.`]}];
const pitfalls=lesson?.pitfalls??[];
const refs=lesson?.refs??[];
const hasContent=!!lesson?.sections?.length;
return <><button className="back" onClick={()=>{setWeek(session.week);go('#/plano')}}><ChevronLeft size={17}/> Voltar ao plano</button><div className="eyebrow">SEMANA {session.week} · DIA {pad(session.id)}{entry?.done&&<span className="done-badge">Concluída</span>}</div><h1>{session.title}</h1><p className="lead">{session.block} · Sessão de 120 minutos</p><div className="time-grid"><span>40 min<br/><b>Teoria</b></span><span>60 min<br/><b>Exercícios</b></span><span>20 min<br/><b>Revisão</b></span></div>{!ready?<div className="loading"><span className="spinner"/>Carregando aula…</div>:<article className="panel lesson"><h2>Objetivos de aprendizagem</h2><ul>{objectives.map((o,i)=><li key={i}>{o}</li>)}</ul>{sections.map((sec,i)=><React.Fragment key={i}><h2>{sec.h}</h2>{sec.formula&&<div className="formula">{sec.formula}</div>}{(sec.p??[]).map((par,j)=><p key={j}>{par}</p>)}{sec.list&&<ul>{sec.list.map((li,j)=><li key={j}>{li}</li>)}</ul>}</React.Fragment>)}{pitfalls.length>0&&<><h2>Erros e pegadinhas frequentes</h2><ul>{pitfalls.map((p,i)=><li key={i}>{p}</li>)}</ul></>}{refs.length>0&&<p className="muted">Referências: {refs.join(' · ')}</p>}<div className="notice"><Info size={18}/><span>{hasContent?'Conteúdo original desta sessão. Confira as normas e o edital vigentes.':'Roteiro inicial: esta aula ainda precisa de desenvolvimento didático completo e questões específicas antes do uso como curso final.'}</span></div></article>}<button className="primary" onClick={()=>go('#/sessao/'+session.id+'/quiz')}>Praticar com {count==null?'…':count} questões <ChevronRight size={18}/></button><button className="secondary" onClick={()=>{const next=curriculum.find(s=>s.id===session.id+1);if(next)open(next)}} disabled={session.id===85}>Próxima sessão <ChevronRight size={18}/></button><button className="link" onClick={()=>setProgress(toggleDone(progress,session.id))}>{entry?.done?'Desmarcar conclusão':'Marcar como concluída'}</button></>}

function App(){
const [route,setRoute]=useState<Route>(()=>parseHash());
const [progress,setProgress]=useState<ProgressStore>(loadProgress);
const [week,setWeek]=useState(()=>{const s=curriculum.find(x=>x.id===progress.last);return s?s.week:1});
const [quizActive,setQuizActive]=useState(false);
const [theme,setTheme]=useState<Theme>(readTheme);
useEffect(()=>{applyTheme(theme)},[theme]);
const weekSelRef=useRef<HTMLDivElement|null>(null);
const activeId=route.page==='lesson'||route.page==='quiz'?route.id:null;
const selected=useMemo(()=>curriculum.find(s=>s.id===activeId)??curriculum[0],[activeId]);
const go=(hash:string)=>{if(window.location.hash!==hash)window.location.hash=hash};
const open=(s:Session)=>go('#/sessao/'+s.id);
useEffect(()=>{
  const onHash=()=>{setRoute(parseHash());window.scrollTo(0,0)};
  window.addEventListener('hashchange',onHash);
  return()=>window.removeEventListener('hashchange',onHash);
},[]);
useEffect(()=>{if(activeId!=null&&progress.last!==activeId)setProgress(setLast(progress,activeId))},[route]);
useEffect(()=>{if(route.page==='plan')weekSelRef.current?.querySelector('.active')?.scrollIntoView({inline:'center',block:'nearest'})},[route,week]);
const bankCount=Object.keys(progress.missed).length;
const doneCount=Object.values(progress.sessions).filter(s=>s.done).length;
const nextUp=curriculum.find(s=>!progress.sessions[String(s.id)]?.done);
const continueS=nextUp??(progress.last!=null?curriculum.find(s=>s.id===progress.last):undefined)??curriculum[0];
const aulaTarget=activeId!=null?selected:continueS;
return <div className="app"><header className="top"><div className="brand" onClick={()=>{go('#/');window.scrollTo(0,0)}}><span className="logo"><GraduationCap size={23}/></span><span><b>Aprova CRC</b><small>Exame de Suficiência CFC</small></span></div><div className="top-actions"><span className="tag">Gratuito</span><button className="theme-toggle" aria-label={theme==='dark'?'Mudar para tema claro':'Mudar para tema escuro'} onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button></div></header>
<main>
{route.page==='home'&&<><div className="eyebrow">SEU PLANO DE ESTUDOS</div><h1>Seu caminho até o CRC começa aqui.</h1><p className="lead">Um roteiro direto para estudar no celular, com 2 horas por dia, de segunda a sexta.</p><div className="hero"><div className="hero-head">Plano de preparação <span>17 semanas</span></div><div className="stats"><div><strong>85</strong><small>sessões</small></div><div><strong>170h</strong><small>de estudo</small></div><div><strong>35/50</strong><small>meta (mín. 25/50)</small></div></div></div>{doneCount>0||progress.last!=null?<><h2>Continue de onde parou</h2><div className="panel"><div className="progress-line"><small>Semana {continueS.week} · Dia {pad(continueS.id)} · {continueS.block}</small><b>{doneCount}/85</b></div><div className="progress-bar"><span style={{width:Math.round(doneCount/85*100)+'%'}}/></div><h3>{continueS.title}</h3><p>{kindLabel(continueS.kind)} de 2 horas · Semana {continueS.week}, dia {pad(continueS.id)}</p><button className="primary" onClick={()=>open(continueS)}>Continuar <ChevronRight size={18}/></button></div><button className="secondary" onClick={()=>go('#/plano')}><CalendarDays size={18}/> Ver as 85 sessões</button></>:<><h2>Por onde começar?</h2><div className="panel"><div className="eyebrow">DIA 01 · CONTABILIDADE GERAL</div><h3>{curriculum[0].title}</h3><p>Conheça os conceitos essenciais e teste seu conhecimento com questões comentadas.</p><button className="primary" onClick={()=>open(curriculum[0])}>Abrir primeira aula <ChevronRight size={18}/></button></div><button className="secondary" onClick={()=>go('#/plano')}><CalendarDays size={18}/> Ver as 85 sessões</button></>}{bankCount>0&&<button className="review-link" onClick={()=>go('#/revisar')}><RotateCcw size={17}/> Revisar {bankCount} {bankCount===1?'questão errada':'questões erradas'}</button>}<div className="notice"><Info size={18}/><span>Calendário de estudo sugerido, não data oficial da prova. Confira o edital da edição em que for prestar o exame.</span></div>{doneCount>0&&<div className="privacy-note">Seu progresso fica salvo apenas neste navegador, neste dispositivo.<button className="link-danger" onClick={()=>{if(window.confirm('Apagar todo o progresso salvo neste navegador?')){resetProgress();setProgress({last:null,sessions:{},missed:{}})}}}>Apagar progresso</button></div>}</>}
{route.page==='plan'&&<><div className="eyebrow">CALENDÁRIO COMPLETO</div><h1>17 semanas. 85 sessões.</h1><p className="lead">Escolha uma semana e toque em qualquer sessão. Sem criação de conta: o progresso fica salvo neste navegador.</p><div className="week-nav"><button aria-label="Semana anterior" disabled={week===1} onClick={()=>setWeek(w=>w-1)}><ChevronLeft/></button><span>Semana {week} de 17</span><button aria-label="Próxima semana" disabled={week===17} onClick={()=>setWeek(w=>w+1)}><ChevronRight/></button></div><div className="phases" ref={weekSelRef}>{phases.map(ph=>{const done=curriculum.filter(s=>s.block===ph.block&&progress.sessions[String(s.id)]?.done).length;const complete=done===ph.total;const jump=()=>setWeek(ph.weeks.find(w=>curriculum.filter(s=>s.week===w).some(x=>!progress.sessions[String(x.id)]?.done))??ph.weeks[ph.weeks.length-1]);return<div className="phase" key={ph.block}><button className="phase-head" onClick={jump} aria-label={'Ir para a próxima semana pendente de '+ph.block}><span>{ph.block}</span><span className={'phase-count'+(complete?' all-done':'')}>{complete&&<CheckCircle2 size={13}/>}{done}/{ph.total}</span></button><div className="week-select">{ph.weeks.map(w=>{const n=curriculum.filter(s=>s.week===w&&progress.sessions[String(s.id)]?.done).length;return<button key={w} className={(week===w?'active ':'')+(n===5?'complete':'')} onClick={()=>setWeek(w)}><b>{w}</b><small>{n}/5</small></button>})}</div></div>})}</div><h2>{curriculum[(week-1)*5].weekTitle}</h2><p className="muted">{curriculum[(week-1)*5].block} · 10 horas</p><div className="sessions">{curriculum.filter(s=>s.week===week).map(s=>{const e=progress.sessions[String(s.id)];return<button className="session" key={s.id} onClick={()=>open(s)}><span className="session-day">{s.day}<small>Dia {pad(s.id)}</small></span><span className="session-name">{s.title}<small>2 horas · {kindLabel(s.kind)}{e&&e.attempts>0?` · melhor ${e.best}/${e.total}`:''}</small></span>{e?.done?<CheckCircle2 size={20} className="ic-done"/>:<ChevronRight size={18}/>}</button>})}</div></>}
{route.page==='lesson'&&<LessonView key={selected.id} session={selected} progress={progress} setProgress={setProgress} go={go} open={open} setWeek={setWeek}/>}
{(route.page==='quiz'||route.page==='review')&&<QuizView key={route.page==='quiz'?'q'+route.id:'review'} session={route.page==='quiz'?selected:null} progress={progress} setProgress={setProgress} go={go} onPhase={setQuizActive}/>}
</main><nav className={'bottom'+(quizActive?' hidden':'')}><button className={route.page==='home'?'active':''} onClick={()=>{go('#/');window.scrollTo(0,0)}}><GraduationCap size={21}/>Início</button><button className={route.page==='plan'?'active':''} onClick={()=>{go('#/plano');window.scrollTo(0,0)}}><CalendarDays size={21}/>Plano</button><button className={route.page==='lesson'||route.page==='quiz'?'active':''} onClick={()=>open(aulaTarget)}><BookOpen size={21}/>Aula</button></nav></div>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
