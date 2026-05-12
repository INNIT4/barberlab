-- Agrega columnas de Stripe a organizations si no existen
DO $$ BEGIN
  ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
  ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text;
  ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "stripe_price_id" text;
  ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "stripe_status" text;
  ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "stripe_current_period_end" timestamp with time zone;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;--> statement-breakpoint

-- Unique constraints para idempotencia de webhooks
DO $$ BEGIN
  ALTER TABLE "organizations" ADD CONSTRAINT "organizations_stripe_customer_id_unique" UNIQUE ("stripe_customer_id");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "organizations" ADD CONSTRAINT "organizations_stripe_subscription_id_unique" UNIQUE ("stripe_subscription_id");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;--> statement-breakpoint

-- Cambia FK de appointments: ON DELETE RESTRICT → ON DELETE SET NULL
-- Esto permite borrar barberos/servicios/clientes sin romper citas históricas
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_barber_id_barbers_id_fk";--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barber_id_barbers_id_fk"
  FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_service_id_services_id_fk";--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk"
  FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE SET NULL ON UPDATE NO ACTION;--> statement-breakpoint

ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_customer_id_customers_id_fk";--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_customers_id_fk"
  FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;--> statement-breakpoint

-- Hace nullable las columnas FK para que SET NULL funcione
ALTER TABLE "appointments" ALTER COLUMN "barber_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "service_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "customer_id" DROP NOT NULL;--> statement-breakpoint

-- CHECK constraint para price > 0
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_price_positive";--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_price_positive" CHECK ("price_mxn" >= 0);--> statement-breakpoint

ALTER TABLE "walk_ins" DROP CONSTRAINT IF EXISTS "walk_ins_price_positive";--> statement-breakpoint
ALTER TABLE "walk_ins" ADD CONSTRAINT "walk_ins_price_positive" CHECK ("price_mxn" > 0);--> statement-breakpoint

-- Indice para búsquedas por customerId
CREATE INDEX IF NOT EXISTS "appointments_customer_idx" ON "appointments" USING btree ("customer_id");
