import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { FastifyRequest } from "fastify";
import { Injectable } from "@nestjs/common";
import { Constants } from "src/constants";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Constants.rt_signing_key,
      passReqToCallback: true,
    });
  }

  validate(req: FastifyRequest, payload: any) {
    const refreshToken = req.headers.authorization.replace("Bearer", "").trim();
    return {
      ...payload,
      refreshToken: refreshToken,
    };
  }
}
