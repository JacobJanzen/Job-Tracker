import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const STATUSES = [
  "Bookmarked",
  "Applied",
  "Phone Screen",
  "Interviewing",
  "Offer",
  "Rejected",
  "Withdrawn",
] as const;

export const INTEREST_LEVELS = ["High", "Medium", "Low"] as const;

export const prospects = pgTable("prospects", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  roleTitle: text("role_title").notNull(),
  jobUrl: text("job_url"),
  status: text("status").notNull().default("Bookmarked"),
  interestLevel: text("interest_level").notNull().default("Medium"),
  pay: integer("pay"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProspectSchema = createInsertSchema(prospects).omit({
  id: true,
  createdAt: true,
}).extend({
  companyName: z.string().min(1, "Company name is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  status: z.enum(STATUSES).default("Bookmarked"),
  interestLevel: z.enum(INTEREST_LEVELS).default("Medium"),
  pay: z.number().int().positive().optional().nullable(),
  jobUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type InsertProspect = z.infer<typeof insertProspectSchema>;
export type Prospect = typeof prospects.$inferSelect;

export function formatPay(pay: number): string {
  if (pay < 1000) {
    return `$${pay} / hr`;
  }
  if (pay >= 1000000) {
    const inMillions = pay / 1000000;
    const rounded = Math.round(inMillions * 10) / 10;
    const display = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    return `$${display}m`;
  }
  const inThousands = pay / 1000;
  const rounded = Math.round(inThousands * 10) / 10;
  const display = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  return `$${display}k`;
}
