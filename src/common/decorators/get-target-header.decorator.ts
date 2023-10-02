import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { FastifyRequest } from "fastify";

export const GetTargetHeader = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    return request.headers[data];
  },
);
