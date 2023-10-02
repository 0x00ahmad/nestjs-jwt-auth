import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { AuthRequest } from "@prisma/client";
import { PassCode } from "../auth/types";
import { PASSWORD_LENGTH } from "../constants";
import { hashData, verifyHash } from "../crypto_funcs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LoginRequestService {
  constructor(private prisma: PrismaService) { }

  private async getExpiryTime(minutes = 5): Promise<Date> {
    return new Date(new Date().getTime() + minutes * 60000);
  }

  // * public methods
  async sendMail(email: string, code: string): Promise<boolean> {
    // TODO: handle this edge case
    console.log(`Write mail Function to send mail to ${email}, code: ${code}`);
    return true;
  }

  async genCode(size: number): Promise<string> {
    return [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
  }

  async verifyDuplicateRequests(requestersEmail: string): Promise<void> {
    await this.removeTwoFaRequest(requestersEmail);
    const instance = await this.prisma.authRequest.findFirst({
      where: { isTwoFa: false, requestersEmail },
    });
    if (!instance) return;
    const isExpired = new Date() > instance.expiryTime;
    if (isExpired) {
      await this.prisma.authRequest.deleteMany({
        where: { isTwoFa: false, requestersEmail },
      });
      throw new HttpException("Code Expired", HttpStatus.BAD_REQUEST);
    } else {
      throw new HttpException(
        "Already requested for a passcode",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createLoginRequest(email: string): Promise<PassCode> {
    const code = await this.genCode(PASSWORD_LENGTH);
    const hash = await hashData(code);
    const expiryTime = await this.getExpiryTime();
    await this.sendMail(email, code);
    await this.prisma.authRequest.create({
      data: { requestersEmail: email, code: hash, expiryTime },
    });
    return { code };
  }

  async verifyRequest(
    requestersEmail: string,
    passcode: string,
  ): Promise<void> {
    if (passcode.length !== PASSWORD_LENGTH) {
      throw new ForbiddenException("Invalid Code");
    }
    const user = await this.prisma.authRequest.findFirst({
      where: { isTwoFa: false, requestersEmail },
    });
    if (!user)
      throw new HttpException("Code does not exist.", HttpStatus.BAD_REQUEST);
    if (!(await verifyHash(user.code, passcode))) {
      throw new ForbiddenException("Access Denied");
    }
    if (new Date() > user.expiryTime) {
      await this.prisma.authRequest.deleteMany({
        where: { isTwoFa: false, requestersEmail },
      });
      throw new HttpException("Code expired", HttpStatus.OK);
    }
  }

  async removeRequest(requestersEmail: string): Promise<void> {
    await this.prisma.authRequest.deleteMany({
      where: { isTwoFa: false, requestersEmail },
    });
  }

  // ? Two FA Method

  async initTwoFaSetupRequest(
    requestersEmail: string,
    secret: string,
  ): Promise<AuthRequest | undefined> {
    const expiryTime = await this.getExpiryTime();
    return this.prisma.authRequest.create({
      data: { requestersEmail, code: secret, expiryTime, isTwoFa: true },
    });
  }

  async getTwoFaRequest(
    requestersEmail: string,
  ): Promise<AuthRequest | undefined> {
    return this.prisma.authRequest.findFirst({
      where: { requestersEmail, isTwoFa: true },
    });
  }

  async removeTwoFaRequest(requestersEmail: string): Promise<void> {
    const delCount = await this.prisma.authRequest.deleteMany({
      where: { requestersEmail, isTwoFa: true },
    });
    if (delCount.count > 1) {
      // TODO: handle this edge case
      console.log(
        "ERROR :: Flaw in 2FA, as there were more than one requests deleted at once",
      );
    }
  }
}
