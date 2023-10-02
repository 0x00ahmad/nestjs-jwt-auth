import { Module } from "@nestjs/common";
import { LoginRequestModule } from "src/login-request/login-request.module";
import { UsersModule } from "src/users/users.module";
import { TwoFaController } from "./twofa.controller";
import { TwofaService } from "./twofa.service";

@Module({
  imports: [LoginRequestModule, UsersModule],
  providers: [TwofaService],
  exports: [TwofaService],
  controllers: [TwoFaController],
})
export class TwofaModule { }
