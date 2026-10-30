CREATE TABLE `teacher_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`client_id` text NOT NULL,
	`payload_hash` text NOT NULL,
	`module_id` integer NOT NULL,
	`lesson_id` integer NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`source` text NOT NULL,
	`url` text,
	`file_name` text,
	`content_type` text,
	`byte_size` integer DEFAULT 0 NOT NULL,
	`object_key` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resource_create_dedupe` ON `teacher_resources` (`owner_id`,`client_id`);--> statement-breakpoint
CREATE INDEX `resource_owner_lesson` ON `teacher_resources` (`owner_id`,`module_id`,`lesson_id`);