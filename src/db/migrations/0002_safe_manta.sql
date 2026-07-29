ALTER TABLE "conversation_memory" ALTER COLUMN "conversation_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_memory" ALTER COLUMN "personality_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "personalities" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "personalities" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "voice_sessions" ALTER COLUMN "conversation_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "voice_sessions" ALTER COLUMN "personality_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "conversation_memory" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "voice_sessions" ADD COLUMN "scenario_id" text;--> statement-breakpoint
ALTER TABLE "conversation_memory" ADD CONSTRAINT "conversation_memory_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;