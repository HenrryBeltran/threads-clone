CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`sender` text NOT NULL,
	`receiver` text NOT NULL,
	`message` text NOT NULL,
	`type` text NOT NULL,
	`read_status` integer DEFAULT false,
	`thread_post_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`sender`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`receiver`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
