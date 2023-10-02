import { Module } from "@nestjs/common";
import { LoginRequestService } from "./login-request.service";

@Module({
  providers: [LoginRequestService],
  exports: [LoginRequestService],
})
export class LoginRequestModule { }
