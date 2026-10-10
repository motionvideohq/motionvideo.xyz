CREATE TABLE `community_submission` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`description` text NOT NULL,
	`prompt` text,
	`attribution_consent_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscriber` (
	`email` text PRIMARY KEY NOT NULL,
	`newsletter_consent_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
