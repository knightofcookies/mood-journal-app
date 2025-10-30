ALTER TABLE `ai_settings` ADD COLUMN `provider` text DEFAULT 'openai' NOT NULL;
--> statement-breakpoint
ALTER TABLE `ai_settings` ADD COLUMN `model` text DEFAULT 'gpt-4o-mini' NOT NULL;
--> statement-breakpoint
ALTER TABLE `ai_settings` ADD COLUMN `groq_api_key` text;
--> statement-breakpoint
ALTER TABLE `ai_settings` ADD COLUMN `gemini_api_key` text;
