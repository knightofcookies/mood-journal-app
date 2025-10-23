ALTER TABLE `user` ADD `failed_attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `locked_until` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL;