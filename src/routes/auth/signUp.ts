import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../services/prisma";
import { BadRequest } from "../_erros/badRequest";
import { generatePasswordHash } from "../../utils/generatePasswordHash";

const signUpBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
});

export async function signUp(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/auth/sign-up",
        {
        
            schema: {
                tags:["Auth"],
                summary: "create a new user",
                body: signUpBodySchema,
                response: {
                    201: z.null()
                }
            },
        },
        async (request, reply) => {
            const { email, name, password } = request.body;
            const existentUser = await prisma.user.findUnique({
                where: {
                    email: email,
                },
                
            });

            if (existentUser) {
                throw new BadRequest("you already created a  account");
            }

            const passwordHashed = await generatePasswordHash(password);

            await prisma.user.create({
                data: {
                    email: email,
                    name: name,
                    password: passwordHashed,
                },
            });

            reply.status(201).send()
        }
    );
}
