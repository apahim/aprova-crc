import curriculum from '../curriculum.json';

export type Session=(typeof curriculum)[number];
export type Question={stem:string;options:string[];correct:number;explanation:string;area?:string};
export type LessonSection={h:string;p?:string[];list?:string[];formula?:string};
export type Lesson={objectives?:string[];sections?:LessonSection[];pitfalls?:string[];refs?:string[]};
export type Item={id:string;q:Question};

export const demo:Question[]=[
{stem:'Uma empresa possui R$ 180.000 em ativos e R$ 65.000 em obrigações. Qual é o patrimônio líquido?',options:['R$ 65.000','R$ 115.000','R$ 180.000','R$ 245.000'],correct:1,explanation:'Patrimônio líquido = Ativo − Passivo = 180.000 − 65.000 = R$ 115.000.',area:'Contabilidade Geral'},
{stem:'Qual das opções representa um direito da empresa?',options:['Salários a pagar','Empréstimo bancário a pagar','Clientes a receber','Capital social'],correct:2,explanation:'Clientes a receber representa um direito de receber recursos, portanto integra o ativo.',area:'Contabilidade Geral'},
{stem:'Se uma empresa adquire mercadorias à vista, qual é o efeito imediato no total do ativo?',options:['Aumenta','Diminui','Não se altera','Torna-se negativo'],correct:2,explanation:'Há troca entre contas do ativo: diminui caixa e aumenta estoque pelo mesmo valor (desconsiderados tributos e custos acessórios).',area:'Contabilidade Geral'},
{stem:'Uma obrigação presente decorrente de eventos passados, cuja liquidação deve resultar em saída de recursos, corresponde, em termos gerais, a:',options:['Ativo','Passivo','Receita','Despesa antecipada'],correct:1,explanation:'Passivo é uma obrigação presente da entidade de transferir um recurso econômico como resultado de eventos passados.',area:'Contabilidade Geral'},
{stem:'Uma empresa tem ativo de R$ 90.000 e patrimônio líquido de R$ 25.000. Quanto é o passivo?',options:['R$ 25.000','R$ 65.000','R$ 90.000','R$ 115.000'],correct:1,explanation:'Passivo = Ativo − Patrimônio Líquido = 90.000 − 25.000 = R$ 65.000.',area:'Contabilidade Geral'}];

/** Sessions that have a mini-simulado bank (minis-a.json / minis-b.json). */
export const miniSessions=new Set([20,25,35,40,50,55]);

const cache=new Map<string,Promise<unknown>>();
function once<T>(key:string,load:()=>Promise<T>):Promise<T>{
  const hit=cache.get(key)as Promise<T>|undefined;
  if(!hit)cache.set(key,load());
  return cache.get(key)as Promise<T>;
}

type LessonFile=Record<string,Lesson>;
type BankFile=Record<string,Question[]>;

const lessonFiles:Record<string,()=>Promise<{default:LessonFile}>>={
  '01-15':()=>import('./lessons-01-15.json'),
  '16-30':()=>import('./lessons-16-30.json'),
  '31-55':()=>import('./lessons-31-55.json'),
  '56-85':()=>import('./lessons-56-85.json')};
const quizFiles:Record<string,()=>Promise<{default:BankFile}>>={
  '01-10':()=>import('./quizzes-01-10.json'),
  '11-20':()=>import('./quizzes-11-20.json'),
  '21-30':()=>import('./quizzes-21-30.json'),
  '31-44':()=>import('./quizzes-31-44.json'),
  '45-60':()=>import('./quizzes-45-60.json'),
  '61-70':()=>import('./quizzes-61-70.json')};
const miniFiles:Record<'a'|'b',()=>Promise<{default:BankFile}>>={
  a:()=>import('./minis-a.json'),
  b:()=>import('./minis-b.json')};
const simFiles:Record<'A'|'B'|'C',()=>Promise<{default:Question[]}>>={
  A:()=>import('./simulado-a.json'),
  B:()=>import('./simulado-b.json'),
  C:()=>import('./simulado-c.json')};

export const lessonRange=(id:number):string=>id<=15?'01-15':id<=30?'16-30':id<=55?'31-55':'56-85';
export const quizRange=(id:number):string=>id<=10?'01-10':id<=20?'11-20':id<=30?'21-30':id<=44?'31-44':id<=60?'45-60':'61-70';
export const miniFileOf=(id:number):'a'|'b'=>id<=35?'a':'b';
export const quizRanges=Object.keys(quizFiles);

export const loadLessons=(range:string):Promise<LessonFile>=>once('l'+range,()=>lessonFiles[range]().then(m=>m.default));
export const loadQuizzes=(range:string):Promise<BankFile>=>once('q'+range,()=>quizFiles[range]().then(m=>m.default));
export const loadMinis=(file:'a'|'b'):Promise<BankFile>=>once('m'+file,()=>miniFiles[file]().then(m=>m.default));
export const loadSimulado=(letter:'A'|'B'|'C'):Promise<Question[]>=>once('x'+letter,()=>simFiles[letter]().then(m=>m.default));

export const loadLesson=async(id:number):Promise<Lesson|undefined>=>(await loadLessons(lessonRange(id)))[String(id)];
export const loadQuizBank=async(id:number):Promise<Question[]|undefined>=>(await loadQuizzes(quizRange(id)))[String(id)];
export const loadMini=async(id:number):Promise<Question[]|undefined>=>(await loadMinis(miniFileOf(id)))[String(id)];

export async function loadAllQuizzes():Promise<BankFile>{
  const files=await Promise.all(quizRanges.map(loadQuizzes));
  return Object.assign({},...files);
}

async function resolveQuestion(id:string):Promise<Question|undefined>{
  const parts=id.split(':');
  if(parts[0]==='d')return demo[Number(parts[1])];
  if(parts[0]==='x')return (await loadSimulado(parts[1] as 'A'|'B'|'C'))[Number(parts[2])];
  if(parts[0]==='s'){const bank=await loadQuizBank(Number(parts[1]));return bank?.[Number(parts[2])]}
  if(parts[0]==='m'){const bank=await loadMini(Number(parts[1]));return bank?.[Number(parts[2])]}
  return undefined;
}

/** Resolve stable question ids (e.g. "s:12:3", "x:A:17") to their questions, loading only the files that contain them. */
export async function resolveItems(ids:string[]):Promise<Item[]>{
  const items=await Promise.all(ids.map(id=>resolveQuestion(id).then(q=>q?{id,q}:null)));
  return items.filter((x):x is Item=>x!=null);
}
