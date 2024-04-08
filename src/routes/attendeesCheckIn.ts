import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../services/prisma";
import { BadRequest } from "./_erros/badRequest";

const attendeesCheckInRouteParams = z.object({
    attendeeId: z.coerce.number().int(),
});

export async function attendeesCheckIn(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/attendees/:attendeeId/check-in",
        {
            schema: {
                summary: "Check-in an attendee",
                tags: ['Check-ins'],
                params: attendeesCheckInRouteParams,
                response: {
                    201: z.null()
                }
            },
        },
        async (request, reply) => {
            const {attendeeId} = request.params
            const attendeeCheckIn = await prisma.checkIn.findUnique({
                where: {
                    attendeeId: attendeeId
                }
            })

            if(attendeeCheckIn){
                throw new BadRequest("Check-in  already done.")
            }

            await prisma.checkIn.create({
                data: {
                    attendeeId: attendeeId
                }
            })

            reply.status(201)
        }
    );
}
