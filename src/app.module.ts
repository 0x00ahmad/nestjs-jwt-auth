import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "src/prisma/prisma.module";
import { LoginRequestModule } from "./login-request/login-request.module";
import { APP_GUARD } from "@nestjs/core";
import { AccessTokenGuard } from "./common/guards";
import { TwofaModule } from "./twofa/twofa.module";

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      // ignoreEnvFile: process.env.PRODUCTION_ENV === "true",
      // isGlobal: true,
    }),
    LoginRequestModule,
    AuthModule,
    TwofaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
