CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`login` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`role` text NOT NULL,
	`region_id` text NOT NULL,
	`district_id` text NOT NULL,
	`college_id` text NOT NULL,
	`group_name` text,
	`group_key` text,
	`password_hash` text NOT NULL,
	`salt` text NOT NULL,
	`iterations` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_login_unique` ON `accounts` (`login`);--> statement-breakpoint
CREATE INDEX `accounts_group_lookup` ON `accounts` (`college_id`,`group_key`);--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`percent` integer NOT NULL,
	`answers` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `study_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_code_unique` ON `study_groups` (`code`);--> statement-breakpoint
CREATE TABLE `auth_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `login_events` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `study_members` (
	`group_id` text NOT NULL,
	`account_id` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `study_groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `group_member_unique` ON `study_members` (`group_id`,`account_id`);--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`account_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`viewed` integer NOT NULL,
	`completed` integer NOT NULL,
	`best` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `progress_user_lesson` ON `lesson_progress` (`account_id`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `practice_submissions` (
	`account_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`body` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `practice_user_lesson` ON `practice_submissions` (`account_id`,`lesson_id`);