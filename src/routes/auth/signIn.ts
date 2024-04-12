import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../../services/prisma";
import { BadRequest } from "../_erros/badRequest";
import { verifyPassword } from "../../utils/verifyPassword";
import { generateToken } from "../../utils/generateToken";

const signInBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function signIn(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>()
    .post('/auth/sign-in',{
        schema: {
            tags: ["Auth"],
            summary: "make a user signIn",
            body: signInBodySchema
        }
    }, async (request, reply) => {
        const {email,password} = request.body

        const existentUser =  await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if(!existentUser){
            throw new BadRequest("this email is not registered")
        }
    
        const isSamePassword = await verifyPassword({
            password: password,
            hash: existentUser?.password
        })

        if(isSamePassword === false){
            throw new BadRequest("invalid credentials")
        }

        const tokenInformation = {
            id: existentUser.id,
            email: existentUser.email,
            name: existentUser.name,
            photo: existentUser.photo
        }

        const token = await generateToken({
            data: tokenInformation,
        })

        reply.status(200)
            .setCookie("userToken",token)
    })
}