import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isEmailVerified: boolean("is_email_verified").default(false),
  provider: text("provider").default("email"), // email, google, github
  providerId: text("provider_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const certifications = pgTable("certifications", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  level: text("level"), // foundational, associate, professional
  provider: text("provider").default("aws"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const topics = pgTable("topics", {
  id: varchar("id", { length: 100 }).primaryKey(),
  certificationId: varchar("certification_id", { length: 50 }).references(() => certifications.id),
  name: text("name").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id", { length: 100 }).references(() => topics.id),
  question: text("question").notNull(),
  options: json("options").$type<string[]>().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty").default("medium"), // easy, medium, hard
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  certificationId: varchar("certification_id", { length: 50 }).references(() => certifications.id).notNull(),
  topicId: varchar("topic_id", { length: 100 }).references(() => topics.id).notNull(),
  totalQuestions: integer("total_questions").default(0),
  completedQuestions: integer("completed_questions").default(0),
  correctAnswers: integer("correct_answers").default(0),
  bestScore: integer("best_score").default(0),
  lastQuestionIndex: integer("last_question_index").default(0),
  isCompleted: boolean("is_completed").default(false),
  timeSpent: integer("time_spent").default(0), // in seconds
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizSessions = pgTable("quiz_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  topicId: varchar("topic_id", { length: 100 }).references(() => topics.id).notNull(),
  currentQuestionIndex: integer("current_question_index").default(0),
  answers: json("answers").$type<Record<string, number>>().default({}),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  isActive: boolean("is_active").default(true),
});

export const userAnswers = pgTable("user_answers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  questionId: uuid("question_id").references(() => questions.id).notNull(),
  sessionId: uuid("session_id").references(() => quizSessions.id).notNull(),
  selectedAnswer: integer("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpent: integer("time_spent").default(0), // in seconds
  answeredAt: timestamp("answered_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  provider: true,
  providerId: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  startedAt: true,
});

export const insertUserAnswerSchema = createInsertSchema(userAnswers).omit({
  id: true,
  answeredAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Certification = typeof certifications.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type QuizSession = typeof quizSessions.$inferSelect;
export type UserAnswer = typeof userAnswers.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
