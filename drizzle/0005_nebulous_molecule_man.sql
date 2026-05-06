CREATE TABLE IF NOT EXISTS "walk_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action,
	"barber_id" uuid REFERENCES "public"."barbers"("id") ON DELETE set null ON UPDATE no action,
	"service_id" uuid REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action,
	"customer_id" uuid REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action,
	"price_mxn" integer NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "walk_ins_org_date_idx" ON "walk_ins" USING btree ("organization_id","date");