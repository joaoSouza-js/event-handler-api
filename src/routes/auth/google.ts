
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {  OAuth2Client } from "google-auth-library";
import z from "zod";
import { BadRequest } from "../_erros/badRequest";
import { getUserData } from "../../services/getGoogleUserData";
import { evn } from "../../env";

const authGoogleQueryParams = z.object({
    code: z.string().optional()
});


const {GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,REDIRECT_ID} = evn



export async function authGoogle(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/auth/google",
        {
            
            schema: {  
                tags: ["Auth"],  
                summary: "Save google authentication information",   
                querystring: authGoogleQueryParams,
                response: {
                    303: z.null()
                }
                
            },
        },
        async (request, reply) => {
            const {code} = request.query
           
            if(!code) {
                throw new BadRequest("try signIn again")
            }

            try {
                const  oAuthToClient = new OAuth2Client({
                    clientId: GOOGLE_CLIENT_ID,
                    clientSecret: GOOGLE_CLIENT_SECRET,
                    redirectUri:REDIRECT_ID 
                })

                const response = await oAuthToClient.getToken(code)
                await oAuthToClient.setCredentials(response.tokens)
                const userCredentials = oAuthToClient.credentials
                const user = await getUserData(userCredentials.access_token)
              
                reply
                    .code(303)
                    .setCookie("user", JSON.stringify(user))
                    .redirect("http://localhost:5173/dashboard")
              
            }
            catch(error){

            }
        }
    );
}
