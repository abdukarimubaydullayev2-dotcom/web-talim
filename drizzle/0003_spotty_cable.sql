CREATE TABLE `roster_imports` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`client_id` text NOT NULL,
	`payload_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `teaching_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roster_import_dedupe` ON `roster_imports` (`group_id`,`client_id`);--> statement-breakpoint
CREATE TABLE `roster_students` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`import_id` text NOT NULL,
	`position` integer NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`name_key` text NOT NULL,
	`login` text NOT NULL,
	`initial_secret` text,
	`account_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `teaching_groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`import_id`) REFERENCES `roster_imports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roster_student_name` ON `roster_students` (`group_id`,`name_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `roster_login` ON `roster_students` (`login`);--> statement-breakpoint
CREATE UNIQUE INDEX `roster_account` ON `roster_students` (`account_id`);--> statement-breakpoint
CREATE INDEX `roster_import_order` ON `roster_students` (`import_id`,`position`);--> statement-breakpoint
CREATE TABLE `teaching_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`college_id` text NOT NULL,
	`name` text NOT NULL,
	`group_key` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teacher_group_unique` ON `teaching_groups` (`owner_id`,`college_id`,`group_key`);