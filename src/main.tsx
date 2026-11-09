import React,{useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BookOpen,CalendarDays,GraduationCap,ChevronLeft,ChevronRight,CheckCircle2,RotateCcw,Info} from 'lucide-react';
import curriculum from './curriculum.json';
import {lessons,minis,quizzes,simulados} from './content';
import type {Question,Session} from './content';
import './style.css';

const demo:Question[]=[
{stem:'Uma empresa possui R$ 180.000 em ativos e R$ 65.000 em obrigações. Qual é o patrimônio líquido?',options:['R$ 65.000','R$ 115.000','R$ 180.000','R$ 245.000'],correct:1,explanation:'Patrimônio líquido = Ativo − Passivo = 180.000 − 65.000 = R$ 115.000.',area:'Contabilidade Geral'},
{stem:'Qual das opções representa um direito da empresa?',options:['Salários a pagar','Empréstimo bancário a pagar','Clientes a receber','Capital social'],correct:2,explanation:'Clientes a receber representa um direito de receber recursos, portanto integra o ativo.',area:'Contabilidade Geral'},
{stem:'Se uma empresa adquire mercadorias à vista, qual é o efeito imediato no total do ativo?',options:['Aumenta','Diminui','Não se altera','Torna-se negativo'],correct:2,explanation:'Há troca entre contas do ativo: diminui caixa e aumenta estoque pelo mesmo valor (desconsiderados tributos e custos acessórios).',area:'Contabilidade Geral'},
{stem:'Uma obrigação presente decorrente de eventos passados, cuja liquidação deve resultar em saída de recursos, corresponde, em termos gerais, a:',options:['Ativo','Passivo','Receita','Despesa antecipada'],correct:1,explanation:'Passivo é uma obrigação presente da entidade de transferir um recurso econômico como resultado de eventos passados.',area:'Contabilidade Geral'},
{stem:'Uma empresa tem ativo de R$ 90.000 e patrimônio líquido de R$ 25.000. Quanto é o passivo?',options:['R$ 25.000','R$ 65.000','R$ 90.000','R$ 115.000'],correct:1,explanation:'Passivo = Ativo − Patrimônio Líquido = 90.000 − 25.000 = R$ 65.000.',area:'Contabilidade Geral'}];

const kindLabel=(k:string)=>k==='aula'?'Aula':k==='revisao'?'Revisão':'Simulado';
const pad=(n:number)=>String(n).padStart(2,'0');
const simMap:Record<number,{letter:'A'|'B'|'C';from:number;to:number;label:string}>={
71:{letter:'A',from:0,to:25,label:'Simulado A · questões 1 a 25'},
72:{letter:'A',from:25,to:50,label:'Simulado A · questões 26 a 50'},
76:{letter:'B',from:0,to:25,label:'Simulado B · questões 1 a 25'},
77:{letter:'B',from:25,to:50,label:'Simulado B · questões 26 a 50'},
81:{letter:'C',from:0,to:25,label:'Simulado C · questões 1 a 25'},
82:{letter:'C',from:25,to:50,label:'Simulado C · questões 26 a 50'}};
const redoMap:Record<number,'A'|'B'|'C'>={73:'A',78:'B',83:'C'};

function sample(qs:Question[],n:number){const c=[...qs];for(let i=c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[c[i],c[j]]=[c[j],c[i]]}return c.slice(0,n)}

function quizFor(s:Session):{list:Question[];demo:boolean;eyebrow:string;lead:string;simulado:boolean}{
const m=simMap[s.id];
if(m)return{list:simulados[m.letter].slice(m.from,m.to),demo:false,eyebrow:m.label.toUpperCase(),lead:'25 questões originais no formato do exame oficial (4 alternativas). Resolva sem consulta e cronometre: cerca de 3 minutos por questão.',simulado:true};
const redo=redoMap[s.id];
if(redo)return{list:simulados[redo],demo:false,eyebrow:('Refazer simulado '+redo).toUpperCase(),lead:'Refazer o simulado completo depois da correção ajuda a consolidar os pontos ajustados. 50 questões no formato do exame.',simulado:true};
const mini=minis[String(s.id)];
if(mini&&mini.length)return{list:mini,demo:false,eyebrow:'MINI-SIMULADO',lead:'12 questões originais de '+s.block.toLowerCase()+' no formato do exame (4 alternativas). Cronometre e resolva sem consulta.',simulado:true};
const own=quizzes[String(s.id)];
if(own&&own.length)return{list:own,demo:false,eyebrow:'PRÁTICA',lead:'Questões originais sobre '+s.title.toLowerCase()+', no formato do exame (4 alternativas).',simulado:false};
if(s.kind==='revisao'){
const agg=curriculum.filter(x=>x.week===s.week&&x.kind==='aula').flatMap(x=>quizzes[String(x.id)]??[]);
if(agg.length)return{list:sample(agg,Math.min(12,agg.length)),demo:false,eyebrow:'REVISÃO DA SEMANA',lead:'Seleção mista com questões das aulas desta semana.',simulado:false};
const all=Object.values(quizzes).flat();
if(all.length)return{list:sample(all,10),demo:false,eyebrow:'REVISÃO GERAL',lead:'Seleção mista de questões de todo o curso para revisão.',simulado:false};
}
return{list:demo,demo:true,eyebrow:'PRÁTICA DEMONSTRATIVA',lead:'5 questões originais de fundamentos patrimoniais, no formato do exame (4 alternativas).',simulado:false};
}

function App(){
const [page,setPage]=useState<'home'|'plan'|'lesson'|'quiz'>('home');
const [selected,setSelected]=useState<Session>(curriculum[0]);
const [week,setWeek]=useState(1);
const [answers,setAnswers]=useState<Record<number,number>>({});
const [showResult,setShowResult]=useState(false);
const open=(s:Session)=>{setSelected(s);setAnswers({});setShowResult(false);setPage('lesson');window.scrollTo(0,0)};
const startQuiz=()=>{setAnswers({});setShowResult(false);setPage('quiz');window.scrollTo(0,0)};
const quiz=useMemo(()=>quizFor(selected),[selected]);
const score=quiz.list.filter((q,i)=>answers[i]===q.correct).length;
const lesson=lessons[String(selected.id)];
const objectives=lesson?.objectives?.length?lesson.objectives:[`Compreender os conceitos centrais de ${selected.title.toLowerCase()}.`,'Identificar aplicações práticas e armadilhas comuns em questões objetivas.','Revisar o assunto e registrar dúvidas para estudo posterior.'];
const sections=lesson?.sections?.length?lesson.sections:[{h:'Introdução ao tema',p:[`Esta sessão apresenta o tema “${selected.title}” dentro de ${selected.block}. Consulte a norma e o material didático atualizados, identifique definições e classificações, resolva exemplos e verifique os critérios aplicáveis ao assunto.`]}];
const pitfalls=lesson?.pitfalls??[];
const refs=lesson?.refs??[];
const hasContent=!!lesson?.sections?.length;
return <div className="app"><header className="top"><div className="brand" onClick={()=>setPage('home')}><span className="logo"><GraduationCap size={23}/></span><span><b>Aprova CRC</b><small>Exame de Suficiência CFC</small></span></div><span className="tag">Gratuito</span></header>
<main>
{page==='home'&&<><div className="eyebrow">SEU PLANO DE ESTUDOS</div><h1>Seu caminho até o CRC começa aqui.</h1><p className="lead">Um roteiro direto para estudar no celular, com 2 horas por dia, de segunda a sexta.</p><div className="hero"><div className="hero-head">Plano de preparação <span>17 semanas</span></div><div className="stats"><div><strong>85</strong><small>sessões</small></div><div><strong>170h</strong><small>de estudo</small></div><div><strong>35/50</strong><small>meta (mín. 25/50)</small></div></div></div><h2>Por onde começar?</h2><div className="panel"><div className="eyebrow">DIA 01 · CONTABILIDADE GERAL</div><h3>{curriculum[0].title}</h3><p>Conheça os conceitos essenciais e teste seu conhecimento com questões comentadas.</p><button className="primary" onClick={()=>open(curriculum[0])}>Abrir primeira aula <ChevronRight size={18}/></button></div><button className="secondary" onClick={()=>setPage('plan')}><CalendarDays size={18}/> Ver as 85 sessões</button><div className="notice"><Info size={18}/><span>Calendário de estudo sugerido, não data oficial da prova. Confira o edital da edição em que for prestar o exame.</span></div></>}
{page==='plan'&&<><div className="eyebrow">CALENDÁRIO COMPLETO</div><h1>17 semanas. 85 sessões.</h1><p className="lead">Escolha uma semana e toque em qualquer sessão. Não é necessário criar conta.</p><div className="week-nav"><button aria-label="Semana anterior" disabled={week===1} onClick={()=>setWeek(w=>w-1)}><ChevronLeft/></button><span>Semana {week} de 17</span><button aria-label="Próxima semana" disabled={week===17} onClick={()=>setWeek(w=>w+1)}><ChevronRight/></button></div><div className="week-select">{Array.from({length:17},(_,i)=><button key={i} className={week===i+1?'active':''} onClick={()=>setWeek(i+1)}>{i+1}</button>)}</div><h2>{curriculum[(week-1)*5].weekTitle}</h2><p className="muted">{curriculum[(week-1)*5].block} · 10 horas</p><div className="sessions">{curriculum.filter(s=>s.week===week).map(s=><button className="session" key={s.id} onClick={()=>open(s)}><span className="session-day">{s.day}<small>Dia {pad(s.id)}</small></span><span className="session-name">{s.title}<small>2 horas · {kindLabel(s.kind)}</small></span><ChevronRight size={18}/></button>)}</div></>}
{page==='lesson'&&<><button className="back" onClick={()=>{setWeek(selected.week);setPage('plan')}}><ChevronLeft size={17}/> Voltar ao plano</button><div className="eyebrow">SEMANA {selected.week} · DIA {pad(selected.id)}</div><h1>{selected.title}</h1><p className="lead">{selected.block} · Sessão de 120 minutos</p><div className="time-grid"><span>40 min<br/><b>Teoria</b></span><span>60 min<br/><b>Exercícios</b></span><span>20 min<br/><b>Revisão</b></span></div><article className="panel lesson"><h2>Objetivos de aprendizagem</h2><ul>{objectives.map((o,i)=><li key={i}>{o}</li>)}</ul>{sections.map((sec,i)=><React.Fragment key={i}><h2>{sec.h}</h2>{sec.formula&&<div className="formula">{sec.formula}</div>}{(sec.p??[]).map((par,j)=><p key={j}>{par}</p>)}{sec.list&&<ul>{sec.list.map((li,j)=><li key={j}>{li}</li>)}</ul>}</React.Fragment>)}{pitfalls.length>0&&<><h2>Erros e pegadinhas frequentes</h2><ul>{pitfalls.map((p,i)=><li key={i}>{p}</li>)}</ul></>}{refs.length>0&&<p className="muted">Referências: {refs.join(' · ')}</p>}<div className="notice"><Info size={18}/><span>{hasContent?'Conteúdo original desta sessão. Confira as normas e o edital vigentes.':'Roteiro inicial: esta aula ainda precisa de desenvolvimento didático completo e questões específicas antes do uso como curso final.'}</span></div></article><button className="primary" onClick={startQuiz}>Praticar com {quiz.list.length} questões <ChevronRight size={18}/></button><button className="secondary" onClick={()=>{const next=curriculum.find(s=>s.id===selected.id+1);if(next)open(next)}} disabled={selected.id===85}>Próxima sessão <ChevronRight size={18}/></button></>}
{page==='quiz'&&<><button className="back" onClick={()=>setPage('lesson')}><ChevronLeft size={17}/> Voltar à aula</button><div className="eyebrow">{quiz.eyebrow}</div><h1>{quiz.demo?'Teste seus conhecimentos':selected.title}</h1><p className="lead">{quiz.lead}</p>{quiz.list.map((q,i)=><div className="panel question" key={i}><div className="eyebrow">QUESTÃO {pad(i+1)} DE {quiz.list.length}{q.area?` · ${q.area.toUpperCase()}`:''}</div><h3>{q.stem}</h3><div className="options">{q.options.map((opt,j)=><button disabled={showResult} className={'option '+(answers[i]===j?'chosen ':'')+(showResult&&q.correct===j?'correct ':'')+(showResult&&answers[i]===j&&j!==q.correct?'incorrect':'')} onClick={()=>setAnswers(a=>({...a,[i]:j}))} key={j}><span>{'ABCD'[j]}</span>{opt}</button>)}</div>{showResult&&<div className="explanation"><CheckCircle2 size={18}/><span>{q.explanation}</span></div>}</div>)}{showResult?<div className="result"><b>{score}/{quiz.list.length} acertos</b><p>{Math.round(score/quiz.list.length*100)}% de aproveitamento nesta tentativa{quiz.simulado?' · no exame oficial a nota de corte é 25/50 (50%)':''}</p><button className="primary" onClick={()=>{setAnswers({});setShowResult(false);window.scrollTo(0,0)}}><RotateCcw size={17}/> Tentar novamente</button></div>:<button className="primary" disabled={Object.keys(answers).length!==quiz.list.length} onClick={()=>{setShowResult(true);window.scrollTo(0,0)}}>Corrigir respostas <CheckCircle2 size={18}/></button>}</>}
</main><nav className="bottom"><button className={page==='home'?'active':''} onClick={()=>{setPage('home');window.scrollTo(0,0)}}><GraduationCap size={21}/>Início</button><button className={page==='plan'?'active':''} onClick={()=>{setPage('plan');window.scrollTo(0,0)}}><CalendarDays size={21}/>Plano</button><button className={page==='lesson'||page==='quiz'?'active':''} onClick={()=>open(selected)}><BookOpen size={21}/>Aula</button></nav></div>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
