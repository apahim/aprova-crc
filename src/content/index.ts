import curriculum from '../curriculum.json';
import lessons01 from './lessons-01-15.json';
import lessons02 from './lessons-16-30.json';
import lessons03 from './lessons-31-55.json';
import lessons04 from './lessons-56-85.json';
import simuladoA from './simulado-a.json';
import simuladoB from './simulado-b.json';
import simuladoC from './simulado-c.json';
import minisA from './minis-a.json';
import minisB from './minis-b.json';
import quizzes01 from './quizzes-01-10.json';
import quizzes02 from './quizzes-11-20.json';
import quizzes03 from './quizzes-21-30.json';
import quizzes04 from './quizzes-31-44.json';
import quizzes05 from './quizzes-45-60.json';
import quizzes06 from './quizzes-61-70.json';

export type Session=(typeof curriculum)[number];
export type Question={stem:string;options:string[];correct:number;explanation:string;area?:string};
export type LessonSection={h:string;p?:string[];list?:string[];formula?:string};
export type Lesson={objectives?:string[];sections?:LessonSection[];pitfalls?:string[];refs?:string[]};

export const lessons={...lessons01,...lessons02,...lessons03,...lessons04} as Record<string,Lesson>;
export const minis={...minisA,...minisB} as Record<string,Question[]>;
export const quizzes={...quizzes01,...quizzes02,...quizzes03,...quizzes04,...quizzes05,...quizzes06} as Record<string,Question[]>;
export const simulados={A:simuladoA,B:simuladoB,C:simuladoC} as {A:Question[];B:Question[];C:Question[]};
