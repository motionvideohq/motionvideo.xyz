CREATE TABLE `plan_seat` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_row_id` text NOT NULL,
	`email` text NOT NULL,
	`user_id` text,
	`invited_at` integer NOT NULL,
	`accepted_at` integer,
	FOREIGN KEY (`subscription_row_id`) REFERENCES `plan_subscription`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_seat_subscription_email_idx` ON `plan_seat` (`subscription_row_id`,`email`);--> statement-breakpoint
CREATE INDEX `plan_seat_email_idx` ON `plan_seat` (`email`);--> statement-breakpoint
CREATE INDEX `plan_seat_user_idx` ON `plan_seat` (`user_id`);--> statement-breakpoint
CREATE TABLE `plan_subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`email` text NOT NULL,
	`plan` text NOT NULL,
	`billing` text NOT NULL,
	`status` text NOT NULL,
	`subscription_id` text,
	`payment_id` text,
	`customer_id` text NOT NULL,
	`period_end` integer,
	`cancel_at_period_end` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `plan_subscription_user_idx` ON `plan_subscription` (`user_id`);--> statement-breakpoint
CREATE INDEX `plan_subscription_email_idx` ON `plan_subscription` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `plan_subscription_subscription_idx` ON `plan_subscription` (`subscription_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `plan_subscription_payment_idx` ON `plan_subscription` (`payment_id`);