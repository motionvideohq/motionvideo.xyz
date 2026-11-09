CREATE TABLE `create_pass` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tool` text NOT NULL,
	`project_id` text NOT NULL,
	`project_name` text NOT NULL,
	`payment_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `create_pass_payment_id_unique` ON `create_pass` (`payment_id`);--> statement-breakpoint
CREATE INDEX `create_pass_user_idx` ON `create_pass` (`user_id`);--> statement-breakpoint
CREATE INDEX `create_pass_project_idx` ON `create_pass` (`user_id`,`tool`,`project_id`);