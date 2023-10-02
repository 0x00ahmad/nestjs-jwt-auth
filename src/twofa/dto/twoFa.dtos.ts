import { IsString, MaxLength } from "class-validator";

export interface TwoFaSecret {
  secret: string;
  qrcodeImageData: string;
}

export class TwoFaCodeDto {
  @MaxLength(6)
  @IsString()
  code: string;
}

export class BackupCodeDto {
  @MaxLength(6)
  @IsString()
  backupCode: string;
}
