CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"barber_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'confirmada' NOT NULL,
	"price_mxn" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_time_order" CHECK ("appointments"."ends_at" > "appointments"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "barber_services" (
	"barber_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	CONSTRAINT "barber_services_barber_id_service_id_pk" PRIMARY KEY("barber_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "barbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"role" text DEFAULT 'Barbero' NOT NULL,
	"avatar_tone" text DEFAULT 'oklch(0.55 0.14 80)' NOT NULL,
	"working_hours" jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"notes" text,
	"tag" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_org_phone_unique" UNIQUE("organization_id","phone"),
	CONSTRAINT "customers_phone_not_empty" CHECK (length(trim("customers"."phone")) > 0)
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_user_org_unique" UNIQUE("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"address" text,
	"vertical" text DEFAULT 'barbershop' NOT NULL,
	"plan" text DEFAULT 'starter' NOT NULL,
	"timezone" text DEFAULT 'America/Hermosillo' NOT NULL,
	"trial_ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'Corte' NOT NULL,
	"duration_minutes" integer NOT NULL,
	"price_mxn" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barber_id_barbers_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_barber_id_barbers_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barbers" ADD CONSTRAINT "barbers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_org_starts_idx" ON "appointments" USING btree ("organization_id","starts_at");--> statement-breakpoint
CREATE INDEX "appointments_barber_starts_idx" ON "appointments" USING btree ("barber_id","starts_at");--> statement-breakpoint
CREATE INDEX "barbers_org_idx" ON "barbers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "customers_org_phone_idx" ON "customers" USING btree ("organization_id","phone");--> statement-breakpoint
CREATE INDEX "memberships_user_idx" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "services_org_idx" ON "services" USING btree ("organization_id");--> statement-breakpoint
-- Prevención de doble-booking: no dos citas activas del mismo barbero con rangos de tiempo que se traslapen
ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_no_overlap"
  EXCLUDE USING gist (
    "barber_id" WITH =,
    tstzrange("starts_at", "ends_at") WITH &&
  ) WHERE (status <> 'cancelada');--> statement-breakpoint

-- =========================================================================
-- Row-Level Security: aislamiento multi-tenant
-- =========================================================================
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "memberships"  ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "barbers"      ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "services"     ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customers"    ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "barber_services" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- organizations: solo ves tus propias orgs
CREATE POLICY "organizations_tenant" ON "organizations"
  FOR ALL
  USING (id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
  WITH CHECK (id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));--> statement-breakpoint

-- memberships: solo ves tus propias memberships
CREATE POLICY "memberships_self" ON "memberships"
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());--> statement-breakpoint

-- barbers
CREATE POLICY "barbers_tenant" ON "barbers"
  FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));--> statement-breakpoint

-- services
CREATE POLICY "services_tenant" ON "services"
  FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));--> statement-breakpoint

-- customers
CREATE POLICY "customers_tenant" ON "customers"
  FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));--> statement-breakpoint

-- appointments
CREATE POLICY "appointments_tenant" ON "appointments"
  FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));--> statement-breakpoint

-- barber_services (vía tabla barbers)
CREATE POLICY "barber_services_tenant" ON "barber_services"
  FOR ALL
  USING (barber_id IN (SELECT id FROM barbers WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())))
  WITH CHECK (barber_id IN (SELECT id FROM barbers WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())));