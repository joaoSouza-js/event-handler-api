import fastify, { FastifyInstance } from "fastify"
import { BadRequest } from "../routes/_erros/badRequest"
import { ZodError } from "zod"

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler :FastifyErrorHandler  = (error,request,reply) => {
    
    const isValidationError = error instanceof ZodError

    if(isValidationError){
        return reply.status(400).send({
            message: `Error durring validation`,
            error: error.flatten().fieldErrors
        })
    }

    const isBadRequestError = error instanceof BadRequest
    
    if(isBadRequestError){
        reply.status(400).send({
            message: error.message
        })
    }
    return reply.status(500).send({message: "Internal server error"})
}