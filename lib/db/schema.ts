import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// organizations — una barbería
// ============================================================================
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    addressNotes: text("address_notes"),
    // branding / página pública
    tagline: text("tagline"),
    about: text("about"),
    logoUrl: text("logo_url"),
    heroImageUrl: text("hero_image_url"),
    primaryColor: text("primary_color"),
    instagramUrl: text("instagram_url"),
    facebookUrl: text("facebook_url"),
    tiktokUrl: text("tiktok_url"),
    googleMapsUrl: text("google_maps_url"),
    cancellationPolicy: text("cancellation_policy"),
    vertical: text("vertical").notNull().default("barbershop"),
    plan: text("plan", { enum: ["starter", "pro", "premium"] })
      .notNull()
      .default("premium"),
    stripeCustomerId: text("stripe_customer_id").unique(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    stripePriceId: text("stripe_price_id"),
    stripeStatus: text("stripe_status"),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", { withTimezone: true }),
    timezone: text("timezone").notNull().default("America/Hermosillo"),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("organizations_slug_idx").on(t.slug)]
);

// ============================================================================
// memberships — une auth.users con organizations
// ============================================================================
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "staff"] })
      .notNull()
      .default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("memberships_user_org_unique").on(t.userId, t.organizationId),
    index("memberships_user_idx").on(t.userId),
  ]
);

// ============================================================================
// barbers
// ============================================================================
export const barbers = pgTable(
  "barbers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    role: text("role").notNull().default("Barbero"),
    avatarTone: text("avatar_tone").notNull().default("oklch(0.55 0.14 80)"),
    workingHours: jsonb("working_hours").$type<import("@/lib/data/working-hours").WorkingHours>(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("barbers_org_idx").on(t.organizationId)]
);

// ============================================================================
// services
// ============================================================================
export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category", {
      enum: ["Corte", "Barba", "Combo", "Extras"],
    })
      .notNull()
      .default("Corte"),
    durationMinutes: integer("duration_minutes").notNull(),
    priceMxn: integer("price_mxn").notNull(),
    imageUrl: text("image_url"),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("services_org_idx").on(t.organizationId)]
);

// ============================================================================
// barber_services (N:M)
// ============================================================================
export const barberServices = pgTable(
  "barber_services",
  {
    barberId: uuid("barber_id")
      .notNull()
      .references(() => barbers.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.barberId, t.serviceId] })]
);

// ============================================================================
// customers
// ============================================================================
export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    notes: text("notes"),
    tag: text("tag", { enum: ["VIP", "Regular", "Nuevo"] }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("customers_org_phone_unique").on(t.organizationId, t.phone),
    index("customers_org_phone_idx").on(t.organizationId, t.phone),
    check("customers_phone_not_empty", sql`length(trim(${t.phone})) > 0`),
  ]
);

// ============================================================================
// appointments
// ============================================================================
export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    barberId: uuid("barber_id")
      .notNull()
      .references(() => barbers.id, { onDelete: "restrict" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "restrict" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: text("status", {
      enum: ["confirmada", "pendiente", "completada", "cancelada"],
    })
      .notNull()
      .default("confirmada"),
    priceMxn: integer("price_mxn").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("appointments_org_starts_idx").on(t.organizationId, t.startsAt),
    index("appointments_barber_starts_idx").on(t.barberId, t.startsAt),
    check(
      "appointments_time_order",
      sql`${t.endsAt} > ${t.startsAt}`
    ),
  ]
);

// ============================================================================
// invitations — para invitar staff a una organización
// ============================================================================
export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role", { enum: ["owner", "staff"] })
      .notNull()
      .default("staff"),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("invitations_org_idx").on(t.organizationId), index("invitations_token_idx").on(t.token)]
);

// ============================================================================
// notifications — alertas para usuarios del dashboard
// ============================================================================
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("notifications_org_idx").on(t.organizationId)]
);

// ============================================================================
// blog_posts — artículos del blog público
// ============================================================================
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull().default("Consejos"),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("blog_posts_slug_idx").on(t.slug)]
);

// ============================================================================
// expenses — control de gastos de la barbería
// ============================================================================
export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    amountMxn: integer("amount_mxn").notNull(),
    category: text("category", {
      enum: ["Productos", "Alquiler", "Servicios", "Salarios", "Marketing", "Otro"],
    })
      .notNull()
      .default("Otro"),
    date: timestamp("date", { withTimezone: true }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("expenses_org_date_idx").on(t.organizationId, t.date)]
);

// ============================================================================
// walk_ins — ventas sin cita (walk-ins)
// ============================================================================
export const walkIns = pgTable(
  "walk_ins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    barberId: uuid("barber_id").references(() => barbers.id, {
      onDelete: "set null",
    }),
    serviceId: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    priceMxn: integer("price_mxn").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("walk_ins_org_date_idx").on(t.organizationId, t.date)]
);

// ============================================================================
// Relations (para drizzle query builder)
// ============================================================================
export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  barbers: many(barbers),
  services: many(services),
  customers: many(customers),
  appointments: many(appointments),
  walkIns: many(walkIns),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
}));

export const barbersRelations = relations(barbers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [barbers.organizationId],
    references: [organizations.id],
  }),
  barberServices: many(barberServices),
  appointments: many(appointments),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [services.organizationId],
    references: [organizations.id],
  }),
  barberServices: many(barberServices),
}));

export const barberServicesRelations = relations(barberServices, ({ one }) => ({
  barber: one(barbers, {
    fields: [barberServices.barberId],
    references: [barbers.id],
  }),
  service: one(services, {
    fields: [barberServices.serviceId],
    references: [services.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [customers.organizationId],
    references: [organizations.id],
  }),
  appointments: many(appointments),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  organization: one(organizations, {
    fields: [expenses.organizationId],
    references: [organizations.id],
  }),
}));

export const walkInsRelations = relations(walkIns, ({ one }) => ({
  organization: one(organizations, {
    fields: [walkIns.organizationId],
    references: [organizations.id],
  }),
  barber: one(barbers, {
    fields: [walkIns.barberId],
    references: [barbers.id],
  }),
  service: one(services, {
    fields: [walkIns.serviceId],
    references: [services.id],
  }),
  customer: one(customers, {
    fields: [walkIns.customerId],
    references: [customers.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  organization: one(organizations, {
    fields: [appointments.organizationId],
    references: [organizations.id],
  }),
  barber: one(barbers, {
    fields: [appointments.barberId],
    references: [barbers.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
  }),
}));

// ============================================================================
// Types exportados (para Server Actions y UI)
// ============================================================================
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Membership = typeof memberships.$inferSelect;
export type Barber = typeof barbers.$inferSelect;
export type NewBarber = typeof barbers.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type NewWalkIn = typeof walkIns.$inferInsert;
export type WalkIn = typeof walkIns.$inferSelect;
