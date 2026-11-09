import curriculum from '../curriculum.json';
import lessons01 from './lessons-01-15.json';
import lessons02 from './lessons-16-30.json';
import simuladoA from './simulado-a.json';
import simuladoB from './simulado-b.json';
import simuladoC from './simulado-c.json';
import minisRaw from './minis.json';
import quizzes01 from './quizzes-01-10.json';
import quizzes02 from './quizzes-11-20.json';
import quizzes03 from './quizzes-21-30.json';

export type Session=(typeof curriculum)[number];
export type Question={stem:string;options:string[];correct:number;explanation:string;area?:string};
export type LessonSection={h:string;p?:string[];list?:string[];formula?:string};
export type Lesson={objectives?:string[];sections?:LessonSection[];pitfalls?:string[];refs?:string[]};

export const lessons={...lessons01,...lessons02} as Record<string,Lesson>;
export const minis=minisRaw as Record<string,Question[]>;
export const quizzes={...quizzes01,...quizzes02,...quizzes03} as Record<string,Question[]>;
export const simulados={A:simuladoA,B:simuladoB,C:simuladoC} as {A:Question[];B:Question[];C:Question[]};
