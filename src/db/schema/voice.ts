import { pgTable, uuid, text, timestamp, integer, real, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { conversations } from './conversations';

export const personalities = pgTable('personalities', {
  id: text('id').primaryKey().notNull(), // text id like 'atlas'
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  description: text('description').notNull(),
  voice: text('voice').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  tone: text('tone').notNull(),
  coachStyle: text('coach_style').notNull(),
  interruptBehavior: text('interrupt_behavior').notNull(),
  temperature: real('temperature').notNull(),
  responseLength: text('response_length').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const voiceSessions = pgTable('voice_sessions', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  personalityId: text('personality_id').notNull().references(() => personalities.id, { onDelete: 'cascade' }),
  scenarioId: text('scenario_id'),
  emotion: text('emotion').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).defaultNow().notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  duration: integer('duration'),
});

export const conversationMemory = pgTable('conversation_memory', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  personalityId: text('personality_id').notNull().references(() => personalities.id, { onDelete: 'cascade' }),
  emotion: text('emotion').notNull(),
  coachScore: integer('coach_score').notNull(),
  importantTopics: jsonb('important_topics').notNull(),
  summary: text('summary').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const conversationMetrics = pgTable('conversation_metrics', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  sessionId: uuid('session_id').notNull().references(() => voiceSessions.id, { onDelete: 'cascade' }),
  confidence: integer('confidence').notNull(),
  energy: integer('energy').notNull(),
  pace: integer('pace').notNull(),
  fillerWords: integer('filler_words').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const coachFeedback = pgTable('coach_feedback', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  sessionId: uuid('session_id').notNull().references(() => voiceSessions.id, { onDelete: 'cascade' }),
  feedbackType: text('feedback_type').notNull(), // e.g., 'tip', 'roast', 'warning'
  text: text('text').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});
