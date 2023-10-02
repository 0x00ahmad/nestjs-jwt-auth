import { Prisma } from "@prisma/client";

export interface FindUserOptions {
  skip?: number;
  take?: number;
  cursor?: Prisma.UserWhereUniqueInput;
  where?: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
}

export interface UserSessionObject {
  ip: string;
  userAgent: string;
  refreshToken: string;
  lastUpdatedAt: string;
}

export interface UpdateUserDto {
  id: number;
  email: string;
}

export interface GetUserOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface DeleteUserDto {
  id: number;
}
