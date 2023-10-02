import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { authenticator } from "otplib";

import { TwoFaSecret } from "./dto/twoFa.dtos";
import { User } from "@prisma/client";
import { LoginRequestService } from "../login-request/login-request.service";
import { Constants } from "../constants";
import { UsersService } from "../users/users.service";
import { hashData, verifyHash } from "../crypto_funcs";

authenticator.options = {
  digits: 6,
  epoch: Date.now(),
  window: [1, 0],
};

@Injectable()
export class TwofaService {
  constructor(
    private loginRequestService: LoginRequestService,
    private usersService: UsersService,
  ) { }

  // two fa methods

  async initiateTwoFa(userId: number, domain_name: string) {
    const user = await this.usersService.findUser(userId);
    if (!user) throw new ForbiddenException("Access Denied");
    return this.generateSecret(user, domain_name);
  }

  async verify2FAInit(email: string, twoFaCode: string): Promise<void> {
    if (twoFaCode.length !== Constants.twoFaCodeLength) {
      throw new ForbiddenException("Invalid Code");
    }
    const user = await this.usersService.findUser(email);
    if (!user) throw new ForbiddenException("Access Denied");
    const secret = await this.verifyInitSecret(email, twoFaCode);
    if (secret.length < 1) throw new ForbiddenException("Access Denied");
    await this.usersService.updateFields(user.id, { twoFaSecret: secret });
    await this.loginRequestService.removeTwoFaRequest(email);
  }

  async generateBackCodes(email: string) {
    const user = await this.usersService.findUser(email);
    if (!user) throw new ForbiddenException("Access Denied");
    const { backupCodes, hashedBackupCodes } = await this.generateBackupCodes();
    const { recoveryKey, hashedRecoveryKey } = await this.generateRecoveryKey();
    await this.usersService.updateFields(user.id, {
      recoveryKey: hashedRecoveryKey,
      backupCodes: hashedBackupCodes,
      is2FaVerified: true,
    });
    return { recoveryKey, backupCodes };
  }

  async validate2FARequest(email: string, twoFaCode: string) {
    if (twoFaCode.length !== Constants.twoFaCodeLength) {
      throw new ForbiddenException("Invalid Code");
    }
    return { verified: await this.verifyCode(email, twoFaCode) };
  }

  async resetTwoFa(email: string, recoveryKey: string) {
    const user = await this.usersService.findUser(email);
    if (!user) throw new ForbiddenException("Access Denied");
    const isVerified = await verifyHash(recoveryKey, user.recoveryKey);
    if (isVerified) throw new ForbiddenException("Access Denied");
    await this.usersService.disable2Fa(email);
    return { disabled: true };
  }

  async disable2Fa(email: string, twoFaCode: string) {
    const { verified } = await this.validate2FARequest(email, twoFaCode);
    if (!verified) throw new ForbiddenException("Access Denied");
    await this.usersService.disable2Fa(email);
    return { disabled: true };
  }

  // ? private methods below

  private async verifyDuplicateRequests(email: string): Promise<void> {
    const out = await this.loginRequestService.getTwoFaRequest(email);
    if (out)
      throw new HttpException(
        "Login session already waiting for confirmation",
        HttpStatus.BAD_REQUEST,
      );
  }

  private async generateSecret(
    user: User,
    domain_name: string,
  ): Promise<TwoFaSecret> {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, domain_name, secret);
    await this.verifyDuplicateRequests(user.email);
    await this.loginRequestService.initTwoFaSetupRequest(user.email, secret);
    return {
      secret: secret,
      qrcodeImageData: otpauth,
    };
  }

  private async verifyInitSecret(
    email: string,
    requestedCode: string,
  ): Promise<string> {
    const instance = await this.loginRequestService.getTwoFaRequest(email);
    if (!instance) return "";
    console.log(
      requestedCode,
      instance.code,
      authenticator.generate(instance.code),
    );
    const verified = authenticator.verify({
      token: requestedCode,
      secret: instance.code,
    });
    console.log(verified);
    return verified ? instance.code : "";
  }

  private async verifyCode(
    email: string,
    requestedCode: string,
  ): Promise<boolean> {
    const user = await this.usersService.findUser(email);
    if (!user || !user.twoFaSecret) {
      throw new ForbiddenException("Access Denied");
    }
    const isOk = await this.verifyCodeAgainstBackupCodes(
      user.backupCodes,
      requestedCode,
    );
    if (
      !authenticator.verify({
        token: requestedCode,
        secret: user.twoFaSecret,
      }) ||
      !isOk
    )
      return false;
    return true;
  }

  private async verifyCodeAgainstBackupCodes(
    backupCodeHashes: any,
    targetCode: string,
  ): Promise<boolean> {
    for (const eachCodeHash of backupCodeHashes) {
      if (await verifyHash(eachCodeHash, targetCode)) return true;
    }
    return false;
  }

  private async generateBackupCodes() {
    const backupCodes = new Array<string>(12);
    const hashedBackupCodes = new Array<string>(12);
    for (let i = 0; i < backupCodes.length; i++) {
      const code = await this.loginRequestService.genCode(6);
      backupCodes[i] = code;
      hashedBackupCodes[i] = await hashData(code);
    }
    return { backupCodes, hashedBackupCodes };
  }

  private async generateRecoveryKey() {
    const recoveryKey = await this.loginRequestService.genCode(16);
    return { recoveryKey, hashedRecoveryKey: await hashData(recoveryKey) };
  }
}
