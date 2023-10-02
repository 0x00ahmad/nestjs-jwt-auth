import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { Observable } from "rxjs";
import { Constants } from "../../constants";

@Injectable()
export class DebugAccessGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const debugSecret = request.body as { sKey: string | undefined };
    if (!debugSecret.sKey || debugSecret.sKey !== Constants.debug_secret)
      return false;
    return true;
  }
}
