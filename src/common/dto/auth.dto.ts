import { UserType } from "@prisma/client";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class SendMailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class JwtUser {
  exp: string;
  iat: string;
  sub: number;
  usernameId: string;
  email: string;
}

export class SignUpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  usernameId: string;
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsNotEmpty()
  @IsEnum(UserType)
  userType: string;
}

export class DebugSignUpDto extends SignUpDto {
  sKey: string;
}

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  usernameId: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class DeleteAccountDto {
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsOptional()
  @IsString()
  twoFaCode: string;
}

export class ResetAccountPasswordDto {
  @IsNotEmpty()
  @IsString()
  associated_user: string;
  @IsNotEmpty()
  @IsString()
  newPassword: string;
  @IsNotEmpty()
  @IsString()
  password: string;
  @IsOptional()
  @IsString()
  twoFaCode: string;
}

export interface RequestMetaData {
  ip: string;
  userAgent: string;
}

export interface SessionObject {
  ip: string;
  userAgent: string;
  loggedInAt: string;
  refreshTokenHash: string;
}

export interface ApiResponse {
  detail: string;
}
