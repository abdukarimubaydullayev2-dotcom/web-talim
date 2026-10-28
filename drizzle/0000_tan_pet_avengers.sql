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
CREATE TABLE `auth_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
