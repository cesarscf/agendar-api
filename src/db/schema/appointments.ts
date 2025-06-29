import { customerServicePackageUsages } from "@/db/schema/customer-service-packages-usages"
import { customers } from "@/db/schema/customers"
import { employees } from "@/db/schema/employees"
import { establishments } from "@/db/schema/establishments"
import { services } from "@/db/schema/services"
import { relations } from "drizzle-orm"
import {
  boolean,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const appointmentStatusValues = [
  "scheduled",
  "completed",
  "canceled",
] as const
export const appointmentStatusEnum = pgEnum(
  "appointment_status",
  appointmentStatusValues
)

export const paymentTypeEnum = pgEnum("payment_type", [
  "pix",
  "credit_card",
  "debit_card",
  "cash",
  "package",
  "loyalty",
  "other",
])

export const appointments = pgTable("appointments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  establishmentId: uuid("establishment_id")
    .notNull()
    .references(() => establishments.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: appointmentStatusEnum("status").notNull().default("scheduled"),
  checkin: boolean("checkin").notNull().default(false),
  checkinAt: timestamp("checkin_at"),
  paymentType: paymentTypeEnum("payment_type"),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  paymentNote: text("payment_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  employee: one(employees, {
    fields: [appointments.employeeId],
    references: [employees.id],
    relationName: "employeeAppointments",
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
    relationName: "serviceAppointments",
  }),
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
    relationName: "customerAppointments",
  }),
  packageAppointment: one(customerServicePackageUsages, {
    fields: [appointments.id],
    references: [customerServicePackageUsages.appointmentId],
    relationName: "appointmentPackageAppointment",
  }),
}))

export type Appointments = typeof appointments.$inferSelect
export type NewAppointments = typeof appointments.$inferInsert
