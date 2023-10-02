import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  GetCurrentUser,
  GetCurrentUserWithRT,
  GetRequestIpAndUserAgent,
  Public,
} from "../common/decorators";
import {
  ApiResponse,
  AuthDto,
  DebugSignUpDto,
  DeleteAccountDto,
  RequestMetaData,
  ResetAccountPasswordDto,
} from "../common/dto";
import { Tokens } from "./types";
import { AuthService } from "./auth.service";
import { RequestUser, RTUser } from "../common/types";
import { RefreshTokenGuard } from "../common/guards";
import { DebugAccessGuard } from "../common/guards/debug-access.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(DebugAccessGuard)
  @Post("debug/makeuser")
  @HttpCode(HttpStatus.CREATED)
  async signUpLocalDebug(@Body() body: DebugSignUpDto): Promise<ApiResponse> {
    return this.authService.signUpLocal(body);
  }

  // ? developer routes above

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async loginLocal(
    @Body() body: AuthDto,
    @GetRequestIpAndUserAgent() rmdDto: RequestMetaData
  ): Promise<Tokens> {
    const { userAgent, ip } = rmdDto;
    return this.authService.loginLocal(body, ip, userAgent);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post("tokens/refresh")
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @GetCurrentUserWithRT() user: RTUser,
    @GetRequestIpAndUserAgent() rmdDto: RequestMetaData
  ) {
    const { userAgent, ip } = rmdDto;
    return this.authService.refreshToken(user.sub, user.refreshToken, ip, userAgent);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetAccountPassword(
    @GetCurrentUser() user: RequestUser,
    @Body() dto: ResetAccountPasswordDto
  ) {
    return this.authService.resetPassword(user, dto);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logOut(
    @GetCurrentUser() user: RequestUser,
    @GetRequestIpAndUserAgent() rmdDto: RequestMetaData
  ) {
    const { userAgent, ip } = rmdDto;
    return this.authService.logOut(user.sub, ip, userAgent);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post("delete-account")
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @GetCurrentUserWithRT() user: RTUser,
    @Body() dto: DeleteAccountDto
  ) {
    return this.authService.deleteAccount(user.sub, user.refreshToken, dto);
  }
}
