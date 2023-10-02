import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { GetCurrentUser } from "src/common/decorators";
import { RequestUser } from "src/common/types";
import { TwofaService } from "./twofa.service";
import { Constants } from "src/constants";
import { TwoFaCodeDto, BackupCodeDto } from "./dto";

@Controller("auth/twofa")
export class TwoFaController {
  constructor(private twoFaService: TwofaService) {}

  @Post("init")
  @HttpCode(HttpStatus.OK)
  async initiateTwoFa(@GetCurrentUser() user: RequestUser) {
    return this.twoFaService.initiateTwoFa(user.sub, Constants.domain_name);
  }

  @Post("init-verify")
  @HttpCode(HttpStatus.OK)
  async verifyInit(
    @GetCurrentUser() user: RequestUser,
    @Body() body: TwoFaCodeDto
  ) {
    await this.twoFaService.verify2FAInit(user.email, body.code);
    return this.twoFaService.generateBackCodes(user.email);
  }

  @Post("validate")
  @HttpCode(HttpStatus.OK)
  async validateRequest(
    @GetCurrentUser() user: RequestUser,
    @Body() body: TwoFaCodeDto
  ) {
    return this.twoFaService.validate2FARequest(user.email, body.code);
  }

  @Post("backup-reset")
  @HttpCode(HttpStatus.OK)
  async backupResetTwoFa(
    @GetCurrentUser() user: RequestUser,
    @Body() body: BackupCodeDto
  ) {
    return this.twoFaService.resetTwoFa(user.email, body.backupCode);
  }

  @Post("disable")
  @HttpCode(HttpStatus.OK)
  async disableTwoFa(
    @GetCurrentUser() user: RequestUser,
    @Body() body: TwoFaCodeDto
  ) {
    return this.twoFaService.disable2Fa(user.email, body.code);
  }
}
