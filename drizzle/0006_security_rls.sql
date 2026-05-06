-- Row-Level Security for tables added after initial migration
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "walk_ins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- invitations: visible solo para miembros de la organización a la que pertenecen
CREATE POLICY "invitations_tenant" ON "invitations"
  FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));--> statement-breakpoint

-- notifications
CREATE POLICY "notifications_tenant" ON "notifications"
  FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));--> statement-breakpoint

-- expenses
CREATE POLICY "expenses_tenant" ON "expenses"
  FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));--> statement-breakpoint

-- walk_ins
CREATE POLICY "walk_ins_tenant" ON "walk_ins"
  FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));
