import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { conversations } from './conversations';

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  tokensUsed: integer('tokens_used'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
