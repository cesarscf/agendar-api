import { db } from "@/db"
import { loyaltyPointRules } from "@/db/schema"
import { appointmentStatusValues, appointments } from "@/db/schema/appointments"
import { customerLoyaltyPoints } from "@/db/schema/customer-loyalty-points"
import { auth } from "@/middlewares/auth"
import { requireActiveSubscription } from "@/middlewares/require-active-subscription"
import { BadRequestError } from "@/routes/erros/bad-request-error"
import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function updateAppointmentStatus(app: FastifyInstance) {
  await app.register(async app => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>()
    typedApp.register(auth)
    typedApp.register(requireActiveSubscription)
    typedApp.patch(
      "/partner/appointments/:id/status",
      {
        schema: {
          tags: ["Appointments"],
          summary: "Update appointment status",
          security: [{ bearerAuth: [] }],
          params: z.object({
            id: z.string().uuid(),
          }),
          body: z.object({
            status: z.enum(appointmentStatusValues),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { establishmentId } = await request.getCurrentEstablishmentId()
        const { id } = request.params
        const { status } = request.body

        const [appointment] = await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.id, id),
              eq(appointments.establishmentId, establishmentId)
            )
          )

        if (!appointment) {
          throw new BadRequestError("Agendamento não encontrado")
        }

        await db
          .update(appointments)
          .set({ status })
          .where(eq(appointments.id, id))

        if (status === "completed" && appointment.paymentType !== "loyalty") {
          const [loyaltyService] = await db
            .select({
              programId: loyaltyPointRules.loyaltyProgramId,
              points: loyaltyPointRules.points,
            })
            .from(loyaltyPointRules)
            .where(eq(loyaltyPointRules.serviceId, appointment.serviceId))

          if (loyaltyService) {
            const { programId, points } = loyaltyService

            const [existing] = await db
              .select()
              .from(customerLoyaltyPoints)
              .where(
                and(
                  eq(customerLoyaltyPoints.customerId, appointment.customerId),
                  eq(customerLoyaltyPoints.loyaltyProgramId, programId)
                )
              )

            if (existing) {
              await db
                .update(customerLoyaltyPoints)
                .set({
                  points: existing.points + points,
                })
                .where(eq(customerLoyaltyPoints.id, existing.id))
            } else {
              await db.insert(customerLoyaltyPoints).values({
                customerId: appointment.customerId,
                loyaltyProgramId: programId,
                points,
              })
            }
          }
        }

        if (status === "completed" && appointment.paymentType === "loyalty") {
          const programIds = await db
            .selectDistinctOn([loyaltyPointRules.loyaltyProgramId])
            .from(loyaltyPointRules)
            .where(eq(loyaltyPointRules.serviceId, appointment.serviceId))

          for (const { loyaltyProgramId } of programIds) {
            await db
              .update(customerLoyaltyPoints)
              .set({ points: 0 })
              .where(
                and(
                  eq(customerLoyaltyPoints.customerId, appointment.customerId),
                  eq(customerLoyaltyPoints.loyaltyProgramId, loyaltyProgramId)
                )
              )
          }
        }

        return reply.status(204).send()
      }
    )
  })
}
