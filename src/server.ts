import Fastify from "fastify";

import {
    serializerCompiler,
    validatorCompiler,
    jsonSchemaTransform,
} from "fastify-type-provider-zod";
import cors from '@fastify/cors'    
import { createEvent } from "./routes/createEvent";
import { registerForEvent } from "./routes/registerForEvent";
import { getEventAttendees } from "./routes/getEventAttendees";
import { getEvent } from "./routes/getEvent";
import { getAttendeeBadge } from "./routes/getAttendeeBadge";
import { attendeesCheckIn } from "./routes/attendeesCheckIn";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { errorHandler } from "./utils/erros-handler";
import { deleteAttendee } from "./routes/deleteAttendee";
import { authGoogle } from "./routes/auth/google";
import { authGoogleUrl } from "./routes/auth/googleCreateAuthURL";
import cookie, { FastifyCookieOptions } from '@fastify/cookie'
import { evn } from "./env";
import { signUp } from "./routes/auth/signUp";
import { signIn } from "./routes/auth/signIn";

const PORT = evn.PORT

const app = Fastify({
    logger: true,
});




app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifySwagger,{
    swagger:{
        consumes: ["application/json"],
        produces: ["application/json"],
        info: {
            title: "pass-in",
            description: "Epecificações  da Api para o back-end da api pass-in",
            version: "1.0.0"
        }
        
    },
    transform:jsonSchemaTransform
})

app.register(fastifySwaggerUI,{
    prefix: '/docs'
})

app.register(cookie, {
    secret: "my-secret", // for cookies signature
    
    parseOptions: {
        path: "/",
        maxAge: 60 * 60 * 24 * 30 // 30 days
    }     // options for parsing cookies
  } as FastifyCookieOptions)

app.register(createEvent);
app.register(signUp)
app.register(signIn)
app.register(registerForEvent);
app.register(getEventAttendees);
app.register(getEvent);
app.register(getAttendeeBadge);
app.register(attendeesCheckIn)
app.register(deleteAttendee)
app.register(authGoogle) 
app.register(authGoogleUrl)
 app.register(cors, { 
    origin: "*"
  })
app.setErrorHandler(errorHandler)

app.listen({
    port: PORT,
    host: "0.0.0.0",
})
    .then(() => {
        console.log(`HTTP Server running on http://localhost:${PORT}`);
    })
    .catch((error) => {
        console.log(error);
    });
