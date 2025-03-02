export interface QuizQuestion {
  id: number;
  text: string;
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  language: string;
  questions: QuizQuestion[];
  isCompleted: boolean;
  score?: number;
}

export interface KoreanPhrasesQuiz extends Quiz {
  language: 'korean';
}
