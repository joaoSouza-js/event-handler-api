import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../services/prisma";
import { BadRequest } from "./_erros/badRequest";

const registerAttendeeBody  = z.object({
    name: z.string(),
    email: z.string().email()
})

const registerAttendeeUrlParams = z.object({
    eventId:  z.string().uuid()
})

const  registerAttendeeSuccessResponse = z.object({
    attendeeId: z.number()
})

export async function registerForEvent(app: FastifyInstance){
    app
        .withTypeProvider<ZodTypeProvider>()
        .post("/events/:eventId/attendee", {
            schema: {
                summary: "Register a attendee in a event.",
                tags: ["Attendee"],
                body: registerAttendeeBody,
                params:registerAttendeeUrlParams,
                response: {
                    201: registerAttendeeSuccessResponse
                }
            }
        }, async (request, reply) => {
            const {eventId} = request.params
            const {name,email} = request.body

            const eventExistent =  await prisma.event.findUnique({
                where: {
                    id: eventId
                },
                select: {
                    Attendee: true,
                    maximumAttendee: true,
                    _count: true
                }
            })

      

            if(!eventExistent){
                throw new Error("i can't find this event")
            }

            const {Attendee} = eventExistent

            const attendeeWithEmailAlreadyExisted = Attendee.find(attendee =>  {
                return attendee.email === email
            })

            if(attendeeWithEmailAlreadyExisted){
                throw new BadRequest("you already have register in this event")
            }

            const {maximumAttendee} = eventExistent
            const attendeeCount = eventExistent?._count.Attendee

            

            if(maximumAttendee !== null  &&  attendeeCount  >= maximumAttendee ){
                throw new BadRequest("this  event reached his max capacity")
            }


            const attendee = await prisma.attendee.create({
                data: {
                    email,
                    name,
                    eventId
                }
            })

            reply.
                status(201)
                .send({attendeeId: attendee.id})
        })
} 