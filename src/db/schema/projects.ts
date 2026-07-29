import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color'),
  icon: text('icon'),
  archived: boolean('archived').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
