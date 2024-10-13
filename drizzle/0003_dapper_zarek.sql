ALTER TABLE `verify_email` RENAME COLUMN `email` TO `new_email`;--> statement-breakpoint
ALTER TABLE `verify_email` ADD `old_email` text NOT NULL;