import { pgTable, uuid, text, integer, timestamp, numeric } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  model: text('model').notNull(),
  promptTokens: integer('prompt_tokens').notNull(),
  completionTokens: integer('completion_tokens').notNull(),
  costEstimate: numeric('cost_estimate', { precision: 10, scale: 6 }), // Estimated cost in USD
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
