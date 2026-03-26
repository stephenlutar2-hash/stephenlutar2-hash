CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"assigned_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_username_unique" UNIQUE("username")
);
