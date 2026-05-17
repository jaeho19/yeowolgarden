CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ann_visible` ON `announcements` (`is_visible`,`is_pinned`,`created_at`);--> statement-breakpoint
CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`application_number` integer NOT NULL,
	`season_year` integer NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`desired_count` integer NOT NULL,
	`total_price_krw` integer NOT NULL,
	`experience` text,
	`memo` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`plot_ids` text,
	`plot_numbers` text,
	`privacy_agreed` integer NOT NULL,
	`approved_at` integer,
	`rejected_at` integer,
	`cancelled_at` integer,
	`rejection_reason` text,
	`admin_note` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_season_email` ON `applications` (`season_year`,`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_season_number` ON `applications` (`season_year`,`application_number`);--> statement-breakpoint
CREATE INDEX `idx_app_status_created` ON `applications` (`season_year`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_app_lookup` ON `applications` (`application_number`,`email`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`payload` text,
	`actor` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_target` ON `audit_logs` (`target_type`,`target_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_created` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `plots` (
	`id` text PRIMARY KEY NOT NULL,
	`plot_number` integer NOT NULL,
	`season_year` integer NOT NULL,
	`area_pyeong` integer DEFAULT 5 NOT NULL,
	`status` text DEFAULT 'AVAILABLE' NOT NULL,
	`application_id` text,
	`zone` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_season_plot` ON `plots` (`season_year`,`plot_number`);--> statement-breakpoint
CREATE INDEX `idx_status_plot` ON `plots` (`status`,`plot_number`);--> statement-breakpoint
CREATE INDEX `idx_plot_season` ON `plots` (`season_year`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
