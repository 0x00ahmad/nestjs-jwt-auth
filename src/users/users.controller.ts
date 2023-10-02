import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { GetCurrentUser, Public } from "src/common/decorators";
import { RequestUser } from "src/common/types";
import { DebugAccessGuard } from "../common/guards/debug-access.guard";
import { UsersService } from "./users.service";

@Controller("users")
export class DebugUserController {
  constructor(private userService: UsersService) { }

  @Public()
  @UseGuards(DebugAccessGuard)
  @Post("all")
  @HttpCode(HttpStatus.OK)
  async verifyInit() {
    return this.userService.findUsers({});
  }

  // create at the auth controller

  @Public()
  @UseGuards(DebugAccessGuard)
  @Post("delete-user")
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Body() body: { sub: number }) {
    if (!body || !body.sub) return { detail: "body invalid" };
    await this.userService.deleteUser(body.sub);
    return { detail: "probably deleted" };
  }

  @Public()
  @UseGuards(DebugAccessGuard)
  @Post("update")
  @HttpCode(HttpStatus.OK)
  async updateUserData(
    @GetCurrentUser() user: RequestUser,
    @Body() inputData: any,
  ) {
    return this.userService.updateFields(user.sub, inputData);
  }
}
