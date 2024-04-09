import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../services/prisma";
import { BadRequest } from "./_erros/badRequest";

const deleteAttendeeRouteParams = z.object({
    attendeeId: z.coerce.number().int().positive(),
});
export async function deleteAttendee(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().delete(
        "/attendees/:attendeeId",
        {
            schema: {
                params: deleteAttendeeRouteParams,
                response: {
                    204: z.null(),
                },
                summary: "This Route Delete a single attendee",
                tags: ["Ateendee"],
            },
        },
        async (request, reply) => {
            const { attendeeId } = request.params;

            const existAttendee = await prisma.attendee.findUnique({
                where: {
                    id: attendeeId,
                },
            });

            if (!existAttendee) {
                throw new BadRequest(
                    "this attendee is already deleted or not exist"
                );
            }

            await prisma.attendee.delete({
                where: {
                    id: attendeeId,
                },
            });

            reply.status(204);
        }
    );
}
