import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and, desc, asc } from 'drizzle-orm';
import { 
  users, certifications, topics, questions, userProgress, quizSessions, userAnswers,
  type User, type InsertUser, type Certification, type Topic, type Question,
  type UserProgress, type QuizSession, type UserAnswer,
  type InsertUserProgress, type InsertQuizSession, type InsertUserAnswer
} from '@shared/schema';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;

  // Certification methods
  getCertifications(): Promise<Certification[]>;
  getCertification(id: string): Promise<Certification | undefined>;

  // Topic methods
  getTopicsByCertification(certificationId: string): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | undefined>;

  // Question methods
  getQuestionsByTopic(topicId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question | undefined>;

  // Progress methods
  getUserProgress(userId: string, certificationId: string): Promise<UserProgress[]>;
  getTopicProgress(userId: string, topicId: string): Promise<UserProgress | undefined>;
  upsertUserProgress(progress: InsertUserProgress): Promise<UserProgress>;

  // Quiz session methods
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  getActiveQuizSession(userId: string, topicId: string): Promise<QuizSession | undefined>;
  updateQuizSession(sessionId: string, updates: Partial<QuizSession>): Promise<QuizSession | undefined>;
  completeQuizSession(sessionId: string, score: number): Promise<QuizSession | undefined>;

  // User answer methods
  saveUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  getUserAnswers(sessionId: string): Promise<UserAnswer[]>;
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required');
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    const result = await this.db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getCertifications(): Promise<Certification[]> {
    return await this.db.select().from(certifications).where(eq(certifications.isActive, true));
  }

  async getCertification(id: string): Promise<Certification | undefined> {
    const result = await this.db.select().from(certifications).where(eq(certifications.id, id)).limit(1);
    return result[0];
  }

  async getTopicsByCertification(certificationId: string): Promise<Topic[]> {
    return await this.db
      .select()
      .from(topics)
      .where(and(eq(topics.certificationId, certificationId), eq(topics.isActive, true)))
      .orderBy(asc(topics.orderIndex));
  }

  async getTopic(id: string): Promise<Topic | undefined> {
    const result = await this.db.select().from(topics).where(eq(topics.id, id)).limit(1);
    return result[0];
  }

  async getQuestionsByTopic(topicId: string): Promise<Question[]> {
    return await this.db
      .select()
      .from(questions)
      .where(and(eq(questions.topicId, topicId), eq(questions.isActive, true)));
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const result = await this.db.select().from(questions).where(eq(questions.id, id)).limit(1);
    return result[0];
  }

  async getUserProgress(userId: string, certificationId: string): Promise<UserProgress[]> {
    return await this.db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.certificationId, certificationId)));
  }

  async getTopicProgress(userId: string, topicId: string): Promise<UserProgress | undefined> {
    const result = await this.db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.topicId, topicId)))
      .limit(1);
    return result[0];
  }

  async upsertUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getTopicProgress(progress.userId, progress.topicId);
    
    if (existing) {
      const result = await this.db
        .update(userProgress)
        .set({ ...progress, updatedAt: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(userProgress).values(progress).returning();
      return result[0];
    }
  }

  async createQuizSession(session: InsertQuizSession): Promise<QuizSession> {
    const result = await this.db.insert(quizSessions).values(session).returning();
    return result[0];
  }

  async getActiveQuizSession(userId: string, topicId: string): Promise<QuizSession | undefined> {
    const result = await this.db
      .select()
      .from(quizSessions)
      .where(and(
        eq(quizSessions.userId, userId),
        eq(quizSessions.topicId, topicId),
        eq(quizSessions.isActive, true)
      ))
      .orderBy(desc(quizSessions.startedAt))
      .limit(1);
    return result[0];
  }

  async updateQuizSession(sessionId: string, updates: Partial<QuizSession>): Promise<QuizSession | undefined> {
    const result = await this.db
      .update(quizSessions)
      .set(updates)
      .where(eq(quizSessions.id, sessionId))
      .returning();
    return result[0];
  }

  async completeQuizSession(sessionId: string, score: number): Promise<QuizSession | undefined> {
    const result = await this.db
      .update(quizSessions)
      .set({
        completedAt: new Date(),
        score,
        isActive: false
      })
      .where(eq(quizSessions.id, sessionId))
      .returning();
    return result[0];
  }

  async saveUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer> {
    const result = await this.db.insert(userAnswers).values(answer).returning();
    return result[0];
  }

  async getUserAnswers(sessionId: string): Promise<UserAnswer[]> {
    return await this.db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.sessionId, sessionId))
      .orderBy(asc(userAnswers.answeredAt));
  }
}

export const storage = new DatabaseStorage();
