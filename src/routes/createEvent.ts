import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { generateSlug } from "../utils/generateSlug";
import { prisma } from "../services/prisma";
import ShortUniqueId from "short-unique-id";
import { BadRequest } from "./_erros/badRequest";

const createEventBodySchema = z.object({
    title: z.string({
        required_error: "Título é obrigatório.",
    }),
    details: z.string().nullable().optional(),
    maximumAttendee: z
        .number()
        .int({ message: "O número deve ser inteiro" })
        .positive()
        .nullable()
        .optional(),
});

export async function createEvent(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/events",
        {
            schema: {
                summary: "Create a event",
                tags: ['Events'],
                body: createEventBodySchema,
                response: {
                    201: z.object({
                        eventId: z.string().uuid(),
                        slug: z.string(),
                    }),
                },
                
            },
        },
        async (request, reply) => {
            const { title, details, maximumAttendee } = request.body;

            if (!title) {
                throw new BadRequest("you must provide a text");
            }

            let slug = generateSlug(title);

            const eventCreated = await prisma.event.findFirst({
                where: {
                    title: { contains: title.toLocaleLowerCase() },
                },
            });

            if (eventCreated) {
                const shortId = new ShortUniqueId({ length: 10 }).rnd();
                slug = `${slug}-${shortId}`;
            }

            const event = await prisma.event.create({
                data: {
                    slug,
                    title,
                    details,
                    maximumAttendee,
                },
            });

            return reply
                .status(201)
                .send({ eventId: event.id, slug: event.slug });
        }
    );
}
