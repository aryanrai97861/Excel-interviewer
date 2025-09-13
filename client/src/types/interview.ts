export interface InterviewSession {
  id: string;
  userId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  totalQuestions: number;
  startedAt: string;
  completedAt?: string;
  overallScore?: number;
  practicalScore?: number;
  conceptualScore?: number;
  explanationScore?: number;
  behavioralScore?: number;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'ai' | 'user';
  content: string;
  messageType: 'text' | 'file_upload' | 'template_download' | 'task';
  metadata?: any;
  timestamp: string;
}

export interface InterviewQuestion {
  id: string;
  sessionId: string;
  questionIndex: number;
  category: 'conceptual' | 'practical' | 'explanation' | 'behavioral';
  question: string;
  expectedAnswer?: string;
  userAnswer?: string;
  fileUploaded?: boolean;
  filePath?: string;
  score?: number;
  aiEvaluation?: any;
  isCompleted: boolean;
  timeSpent?: number;
}

export interface InterviewProgress {
  currentQuestion: number;
  totalQuestions: number;
  percentage: number;
}

export interface SessionDetails {
  session: InterviewSession;
  messages: ChatMessage[];
  questions: InterviewQuestion[];
  progress: InterviewProgress;
}
