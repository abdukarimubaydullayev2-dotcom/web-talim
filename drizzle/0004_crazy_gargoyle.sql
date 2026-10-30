CREATE TABLE `exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text NOT NULL,
	`account_id` text NOT NULL,
	`variant_key` text NOT NULL,
	`paper_json` text NOT NULL,
	`answers_json` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`correct` integer,
	`percent` integer,
	`started_at` integer NOT NULL,
	`submitted_at` integer,
	FOREIGN KEY (`exam_id`) REFERENCES `group_exams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_student_once` ON `exam_attempts` (`exam_id`,`account_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `exam_unique_question_set` ON `exam_attempts` (`exam_id`,`variant_key`);--> statement-breakpoint
CREATE INDEX `exam_attempt_account` ON `exam_attempts` (`account_id`);--> statement-breakpoint
CREATE TABLE `group_exams` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`group_id` text NOT NULL,
	`client_id` text NOT NULL,
	`payload_hash` text NOT NULL,
	`title` text NOT NULL,
	`question_count` integer NOT NULL,
	`bank_count` integer NOT NULL,
	`bank_json` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `teaching_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_create_dedupe` ON `group_exams` (`owner_id`,`client_id`);--> statement-breakpoint
CREATE INDEX `exam_group_date` ON `group_exams` (`group_id`,`created_at`);