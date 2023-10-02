import { Module } from "@nestjs/common";
import { DebugUserController } from "./debug-user.controller";
import { UsersService } from "./users.service";

@Module({
  providers: [UsersService],
  exports: [UsersService],
  controllers: [DebugUserController],
})
export class UsersModule { }
