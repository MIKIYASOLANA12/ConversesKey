import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(), // References auth.users.id
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  username: text('username').unique(),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
