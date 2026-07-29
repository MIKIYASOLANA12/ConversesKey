import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { projects } from './projects';

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  model: text('model').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
