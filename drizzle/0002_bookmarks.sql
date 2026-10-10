CREATE TABLE `bookmarks` (
	`user_id` text NOT NULL,
	`video_slug` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `video_slug`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
