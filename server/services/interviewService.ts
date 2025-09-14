import { storage } from '../storage';
import { ExcelProcessor } from './excelProcessor';
import * as gemini from './gemini';
import type { 
  InterviewSession, 
  InsertInterviewSession,
  ChatMessage,
  InsertChatMessage,
  InterviewQuestion,
  InsertInterviewQuestion 
} from '@shared/schema';

export interface InterviewQuestionTemplate {
  category: 'conceptual' | 'practical' | 'explanation' | 'behavioral';
  question: string;
  expectedAnswer?: string;
  taskType?: string;
  timeLimit?: number; // in minutes
}

export class InterviewService {
  private static readonly QUESTION_TEMPLATES: InterviewQuestionTemplate[] = [
    {
      category: 'conceptual',
      question: 'What are the key differences between VLOOKUP and XLOOKUP? When would you choose one over the other?',
      expectedAnswer: 'XLOOKUP is more flexible, can search left-to-right and right-to-left, returns arrays, has better error handling, and supports approximate and exact matches more intuitively than VLOOKUP.',
    },
    {
      category: 'conceptual',
      question: 'Explain how pivot tables work and when you would use them versus regular formulas for data analysis.',
      expectedAnswer: 'Pivot tables summarize large datasets by grouping and aggregating data dynamically. Use for exploratory analysis, cross-tabulation, and when data structure changes frequently.',
    },
    {
      category: 'practical',
      question: 'Complete the data cleanup task. Clean and standardize the messy customer data provided.',
      taskType: 'data_cleanup',
      timeLimit: 8,
    },
    {
      category: 'practical',
      question: 'Create a sales analysis dashboard with monthly summaries, top products by region, and KPI tracking.',
      taskType: 'sales_analysis',
      timeLimit: 10,
    },
    {
      category: 'explanation',
      question: 'Explain your approach to the sales analysis task. What formulas did you use and why?',
    },
    {
      category: 'conceptual',
      question: 'How would you optimize Excel performance when working with large datasets (100k+ rows)?',
      expectedAnswer: 'Use efficient formulas (avoid volatile functions), limit array formulas, use tables instead of ranges, minimize cross-sheet references, consider Power Query for data transformation.',
    },
    {
      category: 'behavioral',
      question: 'Describe a time when you encountered a #REF! error in Excel. How did you troubleshoot and resolve it?',
    },
    {
      category: 'conceptual',
      question: 'What are dynamic arrays in Excel and how do they differ from traditional array formulas?',
      expectedAnswer: 'Dynamic arrays automatically spill results to adjacent cells, resize automatically, and use the @ operator. They\'re simpler than Ctrl+Shift+Enter array formulas.',
    },
  ];

  static async startInterview(userId: string): Promise<InterviewSession> {
    const sessionData: InsertInterviewSession = {
      userId,
      status: 'in_progress',
      currentQuestionIndex: -1, // Start at -1 to indicate we haven't started asking questions yet
      totalQuestions: this.QUESTION_TEMPLATES.length,
    };

    const session = await storage.createInterviewSession(sessionData);

    // Add welcome message
    await storage.addChatMessage({
      sessionId: session.id,
      sender: 'ai',
      content: `Welcome to your Excel skills assessment! I'm your AI interviewer, and I'll be guiding you through ${this.QUESTION_TEMPLATES.length} questions covering conceptual knowledge, practical tasks, and explanations.

This interview will take approximately 45 minutes and will cover:
• Conceptual Excel knowledge (25%)
• Practical Excel tasks (50%)  
• Explanations and best practices (15%)
• Behavioral and problem-solving (10%)

Let's begin with our first question. Are you ready to start?`,
      messageType: 'text',
    });

    return session;
  }

  static async processUserMessage(
    sessionId: string,
    userMessage: string,
    filePath?: string
  ): Promise<{ session: InterviewSession; messages: ChatMessage[] }> {
    const session = await storage.getInterviewSession(sessionId);
    if (!session) {
      throw new Error('Interview session not found');
    }

    // Add user message
    const messageData: InsertChatMessage = {
      sessionId,
      sender: 'user',
      content: userMessage,
      messageType: filePath ? 'file_upload' : 'text',
      metadata: filePath ? { filePath } : undefined,
    };

    await storage.addChatMessage(messageData);

    // Handle initial welcome response
    if (session.currentQuestionIndex === -1) {
      // User is responding to "Are you ready to start?"
      // Move to first question
      const firstQuestion = this.QUESTION_TEMPLATES[0];
      const aiResponse = `Great! Let's begin with our first question:\n\n${firstQuestion.question}`;
      
      // Update session to move to first question
      const updatedSession = await storage.updateInterviewSession(sessionId, {
        currentQuestionIndex: 0,
      });

      // Add AI response with first question
      await storage.addChatMessage({
        sessionId,
        sender: 'ai',
        content: aiResponse,
        messageType: 'text',
      });

      const messages = await storage.getSessionMessages(sessionId);
      return { session: updatedSession, messages };
    }

    // Get current question
    const currentQuestion = this.QUESTION_TEMPLATES[session.currentQuestionIndex];
    
    // Process the response based on question type
    let aiResponse = '';
    let shouldContinue = true;
    let nextQuestionIndex = session.currentQuestionIndex;

    if (currentQuestion.category === 'practical' && filePath) {
      // Evaluate Excel file
      const evaluation = await this.evaluatePracticalTask(
        sessionId,
        currentQuestion,
        filePath,
        userMessage
      );
      
      aiResponse = `Great! I've received your Excel file. ${evaluation.feedback}`;
      nextQuestionIndex++;
    } else if (currentQuestion.category === 'conceptual') {
      // Evaluate conceptual answer
      const evaluation = await gemini.evaluateConceptualAnswer(
        currentQuestion.question,
        userMessage,
        currentQuestion.expectedAnswer
      );

      // Save question and evaluation
      await storage.addInterviewQuestion({
        sessionId,
        questionIndex: session.currentQuestionIndex,
        category: currentQuestion.category,
        question: currentQuestion.question,
        expectedAnswer: currentQuestion.expectedAnswer,
        userAnswer: userMessage,
        score: evaluation.score.toString(),
        aiEvaluation: evaluation,
        isCompleted: true,
      });

      if (evaluation.score >= 70) {
        aiResponse = `Excellent answer! ${evaluation.reasoning}`;
      } else if (evaluation.score >= 50) {
        aiResponse = `Good understanding shown. ${evaluation.reasoning}`;
      } else {
        aiResponse = `I can see you have some knowledge in this area. ${evaluation.reasoning}`;
      }

      nextQuestionIndex++;
    } else if (currentQuestion.category === 'explanation') {
      // Evaluate explanation
      const evaluation = await gemini.evaluateExplanation(
        'Sales analysis task explanation',
        userMessage
      );

      await storage.addInterviewQuestion({
        sessionId,
        questionIndex: session.currentQuestionIndex,
        category: currentQuestion.category,
        question: currentQuestion.question,
        userAnswer: userMessage,
        score: evaluation.score.toString(),
        aiEvaluation: evaluation,
        isCompleted: true,
      });

      aiResponse = `Thank you for the explanation. ${evaluation.feedback}`;
      nextQuestionIndex++;
    } else if (currentQuestion.category === 'behavioral') {
      // Simple acknowledgment for behavioral questions
      await storage.addInterviewQuestion({
        sessionId,
        questionIndex: session.currentQuestionIndex,
        category: currentQuestion.category,
        question: currentQuestion.question,
        userAnswer: userMessage,
        score: "80", // Default behavioral score
        isCompleted: true,
      });

      aiResponse = 'Thank you for sharing that experience. Problem-solving skills are crucial when working with Excel.';
      nextQuestionIndex++;
    }

    // Check if interview is complete
    if (nextQuestionIndex >= this.QUESTION_TEMPLATES.length) {
      shouldContinue = false;
      aiResponse += ' That completes our interview! Let me calculate your final results.';
      
      // Calculate final scores and complete the interview
      await this.completeInterview(sessionId);
    } else {
      // Ask next question
      const nextQuestion = this.QUESTION_TEMPLATES[nextQuestionIndex];
      aiResponse += `\n\nLet's move to our next question:\n\n${nextQuestion.question}`;
      
      // If it's a practical task, provide template
      if (nextQuestion.category === 'practical' && nextQuestion.taskType) {
        aiResponse += `\n\nI'll provide you with a template file to work with. Please download it, complete the task, and upload your solution.`;
      }
    }

    // Update session
    const updatedSession = await storage.updateInterviewSession(sessionId, {
      currentQuestionIndex: nextQuestionIndex,
      status: shouldContinue ? 'in_progress' : 'completed',
    });

    // Add AI response
    const aiMessageData: InsertChatMessage = {
      sessionId,
      sender: 'ai',
      content: aiResponse,
      messageType: 'text',
    };

    await storage.addChatMessage(aiMessageData);

    // If next question is practical, add template download message
    if (shouldContinue && nextQuestionIndex < this.QUESTION_TEMPLATES.length) {
      const nextQuestion = this.QUESTION_TEMPLATES[nextQuestionIndex];
      if (nextQuestion.category === 'practical' && nextQuestion.taskType) {
        await storage.addChatMessage({
          sessionId,
          sender: 'ai',
          content: 'Template file ready for download',
          messageType: 'template_download',
          metadata: { 
            templateType: nextQuestion.taskType,
            timeLimit: nextQuestion.timeLimit 
          },
        });
      }
    }

    const messages = await storage.getSessionMessages(sessionId);
    return { session: updatedSession, messages };
  }

  private static async evaluatePracticalTask(
    sessionId: string,
    question: InterviewQuestionTemplate,
    filePath: string,
    userExplanation: string
  ) {
    const expectedTemplate = {
      expectedSheets: question.taskType === 'sales_analysis' 
        ? ['Monthly_Summary', 'Top_Products', 'KPI_Dashboard']
        : ['Clean_Data']
    };

    const evaluation = await ExcelProcessor.evaluateExcelFile(
      filePath,
      expectedTemplate,
      question.taskType!
    );

    // Calculate weighted score
    const overallScore = Math.round(
      evaluation.formulaAccuracy * 0.5 +
      evaluation.structureScore * 0.3 +
      evaluation.bestPracticesScore * 0.2
    );

    // Save question and evaluation
    await storage.addInterviewQuestion({
      sessionId,
      questionIndex: await this.getCurrentQuestionIndex(sessionId),
      category: question.category,
      question: question.question,
      userAnswer: userExplanation,
      fileUploaded: true,
      filePath,
      score: overallScore.toString(),
      aiEvaluation: {
        formulaAccuracy: evaluation.formulaAccuracy,
        structureScore: evaluation.structureScore,
        bestPracticesScore: evaluation.bestPracticesScore,
        details: evaluation.details
      },
      isCompleted: true,
    });

    // Save detailed Excel evaluation
    await storage.addExcelEvaluation({
      questionId: await this.getLatestQuestionId(sessionId),
      filePath,
      formulaAccuracy: evaluation.formulaAccuracy.toString(),
      structureScore: evaluation.structureScore.toString(),
      bestPracticesScore: evaluation.bestPracticesScore.toString(),
      evaluationDetails: evaluation.details,
    });

    let feedback = '';
    if (overallScore >= 80) {
      feedback = 'Excellent work on this practical task!';
    } else if (overallScore >= 60) {
      feedback = 'Good job on this task.';
    } else {
      feedback = 'You completed the task, but there are areas for improvement.';
    }

    if (evaluation.details.issues.length > 0) {
      feedback += ` Key areas to note: ${evaluation.details.issues.join(', ')}.`;
    }

    return { feedback, score: overallScore };
  }

  private static async getCurrentQuestionIndex(sessionId: string): Promise<number> {
    const session = await storage.getInterviewSession(sessionId);
    return session?.currentQuestionIndex || 0;
  }

  private static async getLatestQuestionId(sessionId: string): Promise<string> {
    const questions = await storage.getSessionQuestions(sessionId);
    return questions[questions.length - 1]?.id || '';
  }

  private static async completeInterview(sessionId: string): Promise<void> {
    const questions = await storage.getSessionQuestions(sessionId);
    
    // Calculate category scores
    const practicalQuestions = questions.filter(q => q.category === 'practical');
    const conceptualQuestions = questions.filter(q => q.category === 'conceptual');
    const explanationQuestions = questions.filter(q => q.category === 'explanation');
    const behavioralQuestions = questions.filter(q => q.category === 'behavioral');

    const practicalScore = this.calculateAverageScore(practicalQuestions);
    const conceptualScore = this.calculateAverageScore(conceptualQuestions);
    const explanationScore = this.calculateAverageScore(explanationQuestions);
    const behavioralScore = this.calculateAverageScore(behavioralQuestions);

    // Calculate overall weighted score
    const overallScore = Math.round(
      practicalScore * 0.5 +
      conceptualScore * 0.25 +
      explanationScore * 0.15 +
      behavioralScore * 0.1
    );

    // Generate final report using Gemini
    const report = await gemini.generateFinalReport(
      overallScore,
      practicalScore,
      conceptualScore,
      explanationScore,
      behavioralScore,
      { questions }
    );

    // Update session with final results
    await storage.updateInterviewSession(sessionId, {
      status: 'completed',
      completedAt: new Date(),
      overallScore: overallScore.toString(),
      practicalScore: practicalScore.toString(),
      conceptualScore: conceptualScore.toString(),
      explanationScore: explanationScore.toString(),
      behavioralScore: behavioralScore.toString(),
      strengths: report.strengths,
      improvements: report.improvements,
      recommendations: report.recommendations,
    });

    // Add completion message
    await storage.addChatMessage({
      sessionId,
      sender: 'ai',
      content: `Interview completed! Your overall score is ${overallScore}%. Click here to view your detailed results and recommendations.`,
      messageType: 'text',
      metadata: { 
        interviewComplete: true,
        finalScore: overallScore
      },
    });
  }

  private static calculateAverageScore(questions: InterviewQuestion[]): number {
    if (questions.length === 0) return 0;
    const total = questions.reduce((sum, q) => sum + (Number(q.score) || 0), 0);
    return Math.round(total / questions.length);
  }

  static async getSessionWithDetails(sessionId: string) {
    const session = await storage.getInterviewSession(sessionId);
    if (!session) return null;

    const messages = await storage.getSessionMessages(sessionId);
    const questions = await storage.getSessionQuestions(sessionId);

    return {
      session,
      messages,
      questions,
      progress: {
        currentQuestion: session.currentQuestionIndex + 1,
        totalQuestions: session.totalQuestions,
        percentage: Math.round(((session.currentQuestionIndex + 1) / session.totalQuestions) * 100)
      }
    };
  }
}
