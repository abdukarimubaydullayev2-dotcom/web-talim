CREATE TABLE `learning_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`client_id` text NOT NULL,
	`version` text NOT NULL,
	`answers_json` text NOT NULL,
	`quiz_json` text NOT NULL,
	`correct` integer NOT NULL,
	`total` integer NOT NULL,
	`percent` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `learning_lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learning_attempt_dedupe` ON `learning_attempts` (`account_id`,`client_id`);--> statement-breakpoint
CREATE INDEX `learning_attempt_topic` ON `learning_attempts` (`account_id`,`lesson_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `learning_chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`title` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `learning_courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learning_chapter_course` ON `learning_chapters` (`course_id`,`position`);--> statement-breakpoint
CREATE TABLE `learning_course_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`group_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `learning_courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `teaching_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learning_share_unique` ON `learning_course_groups` (`course_id`,`group_id`);--> statement-breakpoint
CREATE INDEX `learning_share_group` ON `learning_course_groups` (`group_id`);--> statement-breakpoint
CREATE TABLE `learning_courses` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learning_course_owner` ON `learning_courses` (`owner_id`);--> statement-breakpoint
CREATE TABLE `learning_events` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`opened_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `learning_lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learning_last_open` ON `learning_events` (`account_id`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `learning_files` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`lesson_id` text,
	`submission_id` text,
	`kind` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`object_key` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `learning_lessons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`submission_id`) REFERENCES `learning_submissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learning_file_owner` ON `learning_files` (`owner_id`);--> statement-breakpoint
CREATE INDEX `learning_file_lesson` ON `learning_files` (`lesson_id`);--> statement-breakpoint
CREATE INDEX `learning_file_submission` ON `learning_files` (`submission_id`);--> statement-breakpoint
CREATE TABLE `learning_lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`chapter_id` text NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`position` integer NOT NULL,
	`conspect` text DEFAULT '' NOT NULL,
	`slides_json` text DEFAULT '[]' NOT NULL,
	`qa_json` text DEFAULT '[]' NOT NULL,
	`quiz_json` text DEFAULT '[]' NOT NULL,
	`quiz_version` text DEFAULT '' NOT NULL,
	`video_url` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`chapter_id`) REFERENCES `learning_chapters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learning_lesson_chapter` ON `learning_lessons` (`chapter_id`,`position`);--> statement-breakpoint
CREATE TABLE `learning_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`submission_revision` integer NOT NULL,
	`action` text NOT NULL,
	`grade` integer,
	`feedback` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `learning_submissions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewer_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learning_review_submission` ON `learning_reviews` (`submission_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `learning_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`account_id` text NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`state` text DEFAULT 'draft' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`submitted_at` integer,
	`grade` integer,
	`feedback` text DEFAULT '' NOT NULL,
	`graded_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `learning_tasks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learning_submission_student` ON `learning_submissions` (`task_id`,`account_id`);--> statement-breakpoint
CREATE INDEX `learning_submission_account` ON `learning_submissions` (`account_id`);--> statement-breakpoint
CREATE TABLE `learning_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`group_id` text NOT NULL,
	`module_id` integer,
	`builtin_lesson_id` integer,
	`lesson_id` text,
	`title` text NOT NULL,
	`instructions` text NOT NULL,
	`due_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `teaching_groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`lesson_id`) REFERENCES `learning_lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learning_task_group` ON `learning_tasks` (`group_id`,`created_at`);