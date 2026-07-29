import { pgTable, uuid, text, boolean } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id').primaryKey().notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  theme: text('theme').default('system').notNull(),
  language: text('language').default('en').notNull(),
  defaultModel: text('default_model').default('gpt-4o-mini').notNull(),
  sidebarCollapsed: boolean('sidebar_collapsed').default(false).notNull(),
});
