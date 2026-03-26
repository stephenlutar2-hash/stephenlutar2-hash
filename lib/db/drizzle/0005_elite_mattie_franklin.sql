CREATE TABLE "carlota_jo_engagements" (
	"id" serial PRIMARY KEY NOT NULL,
	"engagement_code" text NOT NULL,
	"inquiry_id" integer,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"company" text,
	"service" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" text,
	"end_date" text,
	"budget" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "carlota_jo_engagements_engagement_code_unique" UNIQUE("engagement_code")
);
--> statement-breakpoint
CREATE TABLE "carlota_jo_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"inquiry_code" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"service" text DEFAULT '' NOT NULL,
	"budget" text,
	"timeline" text,
	"message" text,
	"company" text,
	"date_preference" text,
	"description" text,
	"type" text DEFAULT 'general_inquiry' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "carlota_jo_inquiries_inquiry_code_unique" UNIQUE("inquiry_code")
);
--> statement-breakpoint
CREATE INDEX "carlota_jo_engagements_status_idx" ON "carlota_jo_engagements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "carlota_jo_engagements_client_email_idx" ON "carlota_jo_engagements" USING btree ("client_email");--> statement-breakpoint
CREATE INDEX "carlota_jo_inquiries_status_idx" ON "carlota_jo_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "carlota_jo_inquiries_type_idx" ON "carlota_jo_inquiries" USING btree ("type");--> statement-breakpoint
CREATE INDEX "carlota_jo_inquiries_email_idx" ON "carlota_jo_inquiries" USING btree ("email");--> statement-breakpoint
CREATE INDEX "carlota_jo_inquiries_created_at_idx" ON "carlota_jo_inquiries" USING btree ("created_at");