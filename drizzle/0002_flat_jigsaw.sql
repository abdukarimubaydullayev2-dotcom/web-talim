CREATE TABLE `activity_events` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`client_id` text NOT NULL,
	`kind` text NOT NULL,
	`module_id` integer,
	`lesson_id` integer,
	`lesson_title` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activity_dedupe` ON `activity_events` (`account_id`,`client_id`);--> statement-breakpoint
CREATE INDEX `activity_date` ON `activity_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `activity_user_lesson` ON `activity_events` (`account_id`,`module_id`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `login_events` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `login_date` ON `login_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `login_user` ON `login_events` (`account_id`);--> statement-breakpoint
CREATE TABLE `test_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`client_id` text NOT NULL,
	`module_id` integer NOT NULL,
	`lesson_id` integer NOT NULL,
	`lesson_title` text NOT NULL,
	`assessment_version` text NOT NULL,
	`answers_json` text NOT NULL,
	`correct` integer NOT NULL,
	`total` integer NOT NULL,
	`percent` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attempt_dedupe` ON `test_attempts` (`account_id`,`client_id`);--> statement-breakpoint
CREATE INDEX `attempt_date` ON `test_attempts` (`created_at`);--> statement-breakpoint
CREATE INDEX `attempt_user_lesson` ON `test_attempts` (`account_id`,`module_id`,`lesson_id`);