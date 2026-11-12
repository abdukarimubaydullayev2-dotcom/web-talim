CREATE TABLE `admin_bootstrap` (
	`id` text PRIMARY KEY NOT NULL,
	`claimed_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`claimed_by`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `administrators` (
	`account_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
