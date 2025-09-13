import {
  users,
  interviewSessions,
  chatMessages,
  interviewQuestions,
  excelEvaluations,
  type User,
  type UpsertUser,
  type InterviewSession,
  type InsertInterviewSession,
  type ChatMessage,
  type InsertChatMessage,
  type InterviewQuestion,
  type InsertInterviewQuestion,
  type ExcelEvaluation,
  type InsertExcelEvaluation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Interview session operations
  createInterviewSession(session: InsertInterviewSession): Promise<InterviewSession>;
  getInterviewSession(id: string): Promise<InterviewSession | undefined>;
  updateInterviewSession(id: string, updates: Partial<InterviewSession>): Promise<InterviewSession>;
  getUserInterviewSessions(userId: string): Promise<InterviewSession[]>;
  
  // Chat message operations
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getSessionMessages(sessionId: string): Promise<ChatMessage[]>;
  
  // Interview question operations
  addInterviewQuestion(question: InsertInterviewQuestion): Promise<InterviewQuestion>;
  getSessionQuestions(sessionId: string): Promise<InterviewQuestion[]>;
  updateInterviewQuestion(id: string, updates: Partial<InterviewQuestion>): Promise<InterviewQuestion>;
  
  // Excel evaluation operations
  addExcelEvaluation(evaluation: InsertExcelEvaluation): Promise<ExcelEvaluation>;
  getQuestionEvaluations(questionId: string): Promise<ExcelEvaluation[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Interview session operations
  async createInterviewSession(session: InsertInterviewSession): Promise<InterviewSession> {
    const [newSession] = await db
      .insert(interviewSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getInterviewSession(id: string): Promise<InterviewSession | undefined> {
    const [session] = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.id, id));
    return session;
  }

  async updateInterviewSession(id: string, updates: Partial<InterviewSession>): Promise<InterviewSession> {
    const [updated] = await db
      .update(interviewSessions)
      .set(updates)
      .where(eq(interviewSessions.id, id))
      .returning();
    return updated;
  }

  async getUserInterviewSessions(userId: string): Promise<InterviewSession[]> {
    return await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.userId, userId))
      .orderBy(desc(interviewSessions.startedAt));
  }

  // Chat message operations
  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }

  // Interview question operations
  async addInterviewQuestion(question: InsertInterviewQuestion): Promise<InterviewQuestion> {
    const [newQuestion] = await db
      .insert(interviewQuestions)
      .values(question)
      .returning();
    return newQuestion;
  }

  async getSessionQuestions(sessionId: string): Promise<InterviewQuestion[]> {
    return await db
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.sessionId, sessionId))
      .orderBy(interviewQuestions.questionIndex);
  }

  async updateInterviewQuestion(id: string, updates: Partial<InterviewQuestion>): Promise<InterviewQuestion> {
    const [updated] = await db
      .update(interviewQuestions)
      .set(updates)
      .where(eq(interviewQuestions.id, id))
      .returning();
    return updated;
  }

  // Excel evaluation operations
  async addExcelEvaluation(evaluation: InsertExcelEvaluation): Promise<ExcelEvaluation> {
    const [newEvaluation] = await db
      .insert(excelEvaluations)
      .values(evaluation)
      .returning();
    return newEvaluation;
  }

  async getQuestionEvaluations(questionId: string): Promise<ExcelEvaluation[]> {
    return await db
      .select()
      .from(excelEvaluations)
      .where(eq(excelEvaluations.questionId, questionId));
  }
}

export const storage = new DatabaseStorage();
