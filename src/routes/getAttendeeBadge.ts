import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../services/prisma";
import { BadRequest } from "./_erros/badRequest";

const AttendeeBadgeRouteParams = z.object({
    attendId: z.coerce.number(),
});

const eventSchema =z.object({
    title: z.string(),
})

const attendeeSchema = z.object({
    event: eventSchema, 
    name: z.string(),
    email: z.string().email(),
    checkInURL: z.string().url()
});

const badgeSuccessResponse = z.object({
    badge: attendeeSchema,
    
});

export async function getAttendeeBadge(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/events/attendee/:attendId/badge",
        {
            schema: {
                summary: "Get a attendee badge information",

                tags: ['Attendee'],
                params: AttendeeBadgeRouteParams,
                response: {
                    200: badgeSuccessResponse,
                },
            },
        },
        async (request, reply) => {
            const { attendId } = request.params;
            const attendee = await prisma.attendee.findUnique({
                where: {
                    id: attendId,
                },
                include: {
                    event: {
                        select: {
                            title: true,
                        },
                    },
                },
            });

            if (!attendee) {
                throw new BadRequest("can't find this attendee");
            }

            const baseURL = `${request.protocol}://${request.hostname}`
            const checkInURL = new URL(`/attendees/${attendId}/check-in`,baseURL)


            return reply.send({
                badge: {
                   event: {
                    title: attendee.event.title
                   },
                   checkInURL: checkInURL.toString(),
                    email: attendee.email,
                    name: attendee.name,
                },
            });
        }
    );
}
