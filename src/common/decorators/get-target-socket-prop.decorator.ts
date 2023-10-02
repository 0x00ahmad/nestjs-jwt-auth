import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";

export const GetTargetSocketProp = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    return request.socket[data];
  }
);

export const GetRequestIpAndUserAgent = createParamDecorator(
  (_: undefined, context: ExecutionContext) => {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const userAgent = request.headers["user-agent"];
    const ip =
      request.headers["x-forwarded-for"] ||
      request.socket["remoteAddress"] ||
      "";
    if (!userAgent || !ip)
      throw new HttpException("Invalid Request", HttpStatus.BAD_REQUEST);
    return { userAgent, ip };
  }
);

export const GetRequestIP = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    return request.headers["x-forwarded-for"] || request.socket[data] || "";
  }
);
