CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'staff' NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "plan" SET DEFAULT 'premium';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "address_notes" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "about" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "hero_image_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "primary_color" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "instagram_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "facebook_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "tiktok_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "google_maps_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "cancellation_policy" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitations_org_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitations_token_idx" ON "invitations" USING btree ("token");