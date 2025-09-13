import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interview sessions
export const interviewSessions = pgTable("interview_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { enum: ["in_progress", "completed", "abandoned"] }).notNull().default("in_progress"),
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(8),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  practicalScore: decimal("practical_score", { precision: 5, scale: 2 }),
  conceptualScore: decimal("conceptual_score", { precision: 5, scale: 2 }),
  explanationScore: decimal("explanation_score", { precision: 5, scale: 2 }),
  behavioralScore: decimal("behavioral_score", { precision: 5, scale: 2 }),
  strengths: jsonb("strengths"),
  improvements: jsonb("improvements"),
  recommendations: jsonb("recommendations"),
});

// Chat messages in interview sessions
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => interviewSessions.id),
  sender: varchar("sender", { enum: ["ai", "user"] }).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type", { enum: ["text", "file_upload", "template_download", "task"] }).notNull().default("text"),
  metadata: jsonb("metadata"), // For file info, task details, etc.
  timestamp: timestamp("timestamp").defaultNow(),
});

// Questions and tasks in the interview
export const interviewQuestions = pgTable("interview_questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid("session_id").notNull().references(() => interviewSessions.id),
  questionIndex: integer("question_index").notNull(),
  category: varchar("category", { enum: ["conceptual", "practical", "explanation", "behavioral"] }).notNull(),
  question: text("question").notNull(),
  expectedAnswer: text("expected_answer"),
  userAnswer: text("user_answer"),
  fileUploaded: boolean("file_uploaded").default(false),
  filePath: varchar("file_path"),
  score: decimal("score", { precision: 5, scale: 2 }),
  aiEvaluation: jsonb("ai_evaluation"),
  isCompleted: boolean("is_completed").default(false),
  timeSpent: integer("time_spent"), // in seconds
});

// Excel file evaluations
export const excelEvaluations = pgTable("excel_evaluations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: uuid("question_id").notNull().references(() => interviewQuestions.id),
  filePath: varchar("file_path").notNull(),
  formulaAccuracy: decimal("formula_accuracy", { precision: 5, scale: 2 }),
  structureScore: decimal("structure_score", { precision: 5, scale: 2 }),
  bestPracticesScore: decimal("best_practices_score", { precision: 5, scale: 2 }),
  evaluationDetails: jsonb("evaluation_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  interviewSessions: many(interviewSessions),
}));

export const interviewSessionsRelations = relations(interviewSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [interviewSessions.userId],
    references: [users.id],
  }),
  chatMessages: many(chatMessages),
  questions: many(interviewQuestions),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(interviewSessions, {
    fields: [chatMessages.sessionId],
    references: [interviewSessions.id],
  }),
}));

export const interviewQuestionsRelations = relations(interviewQuestions, ({ one, many }) => ({
  session: one(interviewSessions, {
    fields: [interviewQuestions.sessionId],
    references: [interviewSessions.id],
  }),
  evaluations: many(excelEvaluations),
}));

export const excelEvaluationsRelations = relations(excelEvaluations, ({ one }) => ({
  question: one(interviewQuestions, {
    fields: [excelEvaluations.questionId],
    references: [interviewQuestions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertInterviewSessionSchema = createInsertSchema(interviewSessions).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertInterviewQuestionSchema = createInsertSchema(interviewQuestions).omit({
  id: true,
});

export const insertExcelEvaluationSchema = createInsertSchema(excelEvaluations).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InterviewSession = typeof interviewSessions.$inferSelect;
export type InsertInterviewSession = z.infer<typeof insertInterviewSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InterviewQuestion = typeof interviewQuestions.$inferSelect;
export type InsertInterviewQuestion = z.infer<typeof insertInterviewQuestionSchema>;
export type ExcelEvaluation = typeof excelEvaluations.$inferSelect;
export type InsertExcelEvaluation = z.infer<typeof insertExcelEvaluationSchema>;
