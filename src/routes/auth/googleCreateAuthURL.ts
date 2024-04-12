import { FastifyInstance } from "fastify";
import { OAuth2Client } from "google-auth-library";
import z from "zod";
import { evn } from "../../env";

const {GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,REDIRECT_ID} = evn

const authGoogleUrlSuccessResponse = z.object({
    url: z.string().url()
})

export async function authGoogleUrl(app: FastifyInstance) {
    app.post('/auth/google/redirect-url',
    {
        
        schema: {
            summary: "generate a google authentication url.",
            tags: ["Auth"],

            response: {
                200: authGoogleUrlSuccessResponse
            }
        }
    },
    async(request,reply)=> {
        reply.header('referrer-policy','no-referrer-when-downgrade')

        const  oAuthToClient = new OAuth2Client({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            redirectUri:REDIRECT_ID 
        })

        const authorizedUrl = oAuthToClient.generateAuthUrl({
            access_type: 'offline',
            scope: ["https://www.googleapis.com/auth/userinfo.profile", "openid"],
            prompt: "consent"
        })

        reply.send({
            url: authorizedUrl
        })
    })
}