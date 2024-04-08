import  { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../services/prisma";
import { BadRequest } from "./_erros/badRequest";

const eventsRouteParams = z.object({
    slug: z.string()
})

const eventsQueryParams = z.object({
    search: z.string().optional().default(''),
    pageIndex: z.coerce.number().optional().default(0),
    limit: z.coerce.number().optional().default(10)
})

const eventResponse = z.object({
    id: z.string(),
    attendees: z.array(z.object({
        id: z.number().int(),
        email: z.string().email(),
        name: z.string(),
        createAt: z.coerce.date(),
        checkInAt: z.coerce.date().nullable()
    })),
    total: z.number()
})

export async function getEventAttendees(app:FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get("/events/:slug/attendees", {
        schema: {
            summary: "Get event attendees.",
            tags: ['Events'],
            querystring: eventsQueryParams,
            params: eventsRouteParams,
            response: {
                200: eventResponse
            }

            
        }
    }, async ( request, reply) => {
        const {slug} = request.params
        const {search,limit,pageIndex} = request.query

        const event = await prisma.event.findUnique({
            where: {
                slug: slug 
                
            },
   
            select: {
                id: true,
                Attendee: {
                    skip: pageIndex * limit ,
                    take: limit,
                    where: {
                        name: {
                            contains: search?.toLowerCase()
                        }
                    },
                    select: {
                        name: true,
                        email: true,
                        id: true,
                        createdAt: true,
                        checkIn: {
                            select: {
                                createdAt: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }

                   
                },
                _count: {
                    select: {
                        Attendee: true
                    }
                }

            },
        })



        if(!event){
            throw new BadRequest("i  can't find this event")
        }

        const total = event._count.Attendee

        const attendeeFormatted = event.Attendee.map(attendee  => {
            return {
                id: attendee.id,
                name: attendee.name,
                email:  attendee.email,
                createAt: attendee.createdAt,
                checkInAt   : attendee.checkIn?.createdAt ?? null
            }
        })

        reply.status(200).send({
            id: event.id,
            attendees: attendeeFormatted,
            total,
        })
        

    })
}