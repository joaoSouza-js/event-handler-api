import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { OAuth2Client } from "google-auth-library";
import z from "zod";
import { BadRequest } from "../_erros/badRequest";
import { getUserData } from "../../services/getGoogleUserData";
import { evn } from "../../env";
import { prisma } from "../../services/prisma";
import { generateToken } from "../../utils/generateToken";

const authGoogleQueryParams = z.object({
    code: z.string().optional(),
});

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_ID } = evn;

export async function authGoogle(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/auth/google",
        {
            schema: {
                tags: ["Auth"],
                summary: "Save google authentication information",
                querystring: authGoogleQueryParams,
                response: {
                    303: z.null(),
                },
            },
        },
        async (request, reply) => {
            const { code } = request.query;

            if (!code) {
                throw new BadRequest("try signIn again");
            }

            try {
                const oAuthToClient = new OAuth2Client({
                    clientId: GOOGLE_CLIENT_ID,
                    clientSecret: GOOGLE_CLIENT_SECRET,
                    redirectUri: REDIRECT_ID,
                });

                const response = await oAuthToClient.getToken(code);
                await oAuthToClient.setCredentials(response.tokens);
                const userCredentials = oAuthToClient.credentials;
                const googleUser = await getUserData(
                    userCredentials.access_token
                );

                let user = await prisma.user.findUnique({
                    where: {
                        email: googleUser.email,
                    },
                    select: {
                        email: true,
                        name: true,
                        id: true,
                        photo: true,
                    },
                });

                if (!user) {
                    const newUser = await prisma.user.create({
                        data: {
                            name: googleUser.name,
                            email: googleUser.email,
                            hasGoogleLogin: true,
                            photo: googleUser.picture,
                        },

                        select: {
                            email: true,
                            name: true,
                            id: true,
                            photo: true,
                        },
                    });

                    user = newUser;

                }
                const token = await generateToken({ data: user });

                reply
                    .code(303)
                    .setCookie("userToken",token)
                    .redirect("http://localhost:5173/dashboard");
            } catch (error) {}
        }
    );
}
