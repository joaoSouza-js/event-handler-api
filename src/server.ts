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

const PORT = 3333;

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

app.register(createEvent);
app.register(registerForEvent);
app.register(getEventAttendees);
app.register(getEvent);
app.register(getAttendeeBadge);
app.register(attendeesCheckIn)
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
