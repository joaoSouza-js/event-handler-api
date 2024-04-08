import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../services/prisma";
import { BadRequest } from "./_erros/badRequest";

const eventRouteParams = z.object({
    id: z.string().uuid(),
});

const event = z.object({
    id: z.string().uuid(),
    title: z.string(),
    details: z.string().nullable(),
    slug: z.string(),
    maximumAttendee: z.number().int().nullable(),
    attendeeAmount: z.number().int()
    
})
const eventSuccessResponse = z.object({
    event: event
    
})

export async function getEvent(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/events/:id",
        {
            schema: {
                summary: "Get a single event.",
                tags: ['Events'],
                params: eventRouteParams,
                response: {
                    200: eventSuccessResponse
                }
            }
        },
        async (request, reply) => {
            const {id} = request.params
            const event = await prisma.event.findUnique({
                where: {
                    id: id
                },
                select: {
                    id: true,   
                    title: true,
                    details: true,
                    slug: true,
                    maximumAttendee: true,
                    _count: {
                        select: {
                            Attendee: true
                        }
                    }
                },

            })

            if(!event){
                throw new BadRequest("this event doesn't exist")
            }
            
            const eventFormatted = {
                ...event,
                attendeeAmount: event._count.Attendee
            }

            reply.status(200).send({
                event: eventFormatted
            })
        }
    );
}
