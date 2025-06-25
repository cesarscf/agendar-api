import { db } from "@/db"
import {
  appointments,
  employeeRecurringBlocks,
  employeeTimeBlocks,
  establishmentAvailability,
  services,
} from "@/db/schema"
import {
  addMinutes,
  format,
  getDay,
  isAfter,
  isBefore,
  isEqual,
} from "date-fns"
import { and, eq, gte, lte } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export async function getAvailability(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/availability",
    {
      schema: {
        tags: ["Availability"],
        summary: "Get available time slots",
        querystring: z.object({
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          employeeId: z.string().uuid(),
          serviceId: z.string().uuid(),
          establishmentId: z.string().uuid(),
        }),
        response: {
          200: z.array(z.string()),
        },
      },
    },
    async (request, reply) => {
      const { date, employeeId, serviceId, establishmentId } = request.query

      const parsedDate = new Date(date)
      const weekday = getDay(parsedDate)

      const availability = await db.query.establishmentAvailability.findFirst({
        where: and(
          eq(establishmentAvailability.establishmentId, establishmentId),
          eq(establishmentAvailability.weekday, weekday)
        ),
      })

      if (!availability) return reply.send([])

      const service = await db.query.services.findFirst({
        where: eq(services.id, serviceId),
        columns: { durationInMinutes: true },
      })

      if (!service) return reply.send([])

      const {
        opensAt: startTime,
        closesAt: endTime,
        breakStart,
        breakEnd,
      } = availability
      const serviceDuration = service.durationInMinutes

      const start = new Date(`${date}T${startTime}`)
      const end = new Date(`${date}T${endTime}`)
      const breakS = breakStart ? new Date(`${date}T${breakStart}`) : null
      const breakE = breakEnd ? new Date(`${date}T${breakEnd}`) : null

      const allSlots: Date[] = []
      let current = new Date(start)
      while (
        isBefore(addMinutes(current, serviceDuration), end) ||
        isEqual(addMinutes(current, serviceDuration), end)
      ) {
        const next = addMinutes(current, serviceDuration)

        const inBreak =
          breakS && breakE && isBefore(current, breakE) && isAfter(next, breakS)

        if (!inBreak) allSlots.push(new Date(current))
        current = next
      }

      const startOfDay = new Date(`${date}T00:00:00`)
      const endOfDay = new Date(`${date}T23:59:59`)

      const [timeBlocks, recurringBlocks, existingAppointments] =
        await Promise.all([
          db
            .select()
            .from(employeeTimeBlocks)
            .where(
              and(
                eq(employeeTimeBlocks.employeeId, employeeId),
                gte(employeeTimeBlocks.startsAt, startOfDay),
                lte(employeeTimeBlocks.endsAt, endOfDay)
              )
            ),

          db
            .select()
            .from(employeeRecurringBlocks)
            .where(
              and(
                eq(employeeRecurringBlocks.employeeId, employeeId),
                eq(employeeRecurringBlocks.weekday, weekday)
              )
            ),

          db
            .select()
            .from(appointments)
            .where(
              and(
                eq(appointments.employeeId, employeeId),
                eq(appointments.establishmentId, establishmentId),
                gte(appointments.startTime, startOfDay),
                lte(appointments.endTime, endOfDay)
              )
            ),
        ])

      const isSlotBlocked = (slot: Date): boolean => {
        const slotEnd = addMinutes(slot, serviceDuration)

        for (const block of timeBlocks) {
          if (
            isBefore(slot, block.endsAt) &&
            isAfter(slotEnd, block.startsAt)
          ) {
            return true
          }
        }

        for (const block of recurringBlocks) {
          const blockStart = new Date(`${date}T${block.startTime}`)
          const blockEnd = new Date(`${date}T${block.endTime}`)
          if (isBefore(slot, blockEnd) && isAfter(slotEnd, blockStart)) {
            return true
          }
        }

        for (const appt of existingAppointments) {
          if (
            isBefore(slot, appt.endTime) &&
            isAfter(slotEnd, appt.startTime)
          ) {
            return true
          }
        }

        return false
      }

      const availableSlots = allSlots
        .filter(slot => !isSlotBlocked(slot))
        .map(slot => format(slot, "HH:mm"))

      return reply.send(availableSlots)
    }
  )
}
