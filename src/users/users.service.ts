import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { FindUserOptions } from "../common/dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findUser(val: string | number): Promise<User | null> {
    const findBy = {} as Prisma.UserWhereUniqueInput;
    // @ts-ignore
    findBy[typeof val === "string" ? "usernameId" : "id"] = val;
    return this.prisma.user.findUnique({ where: findBy });
  }

  async findUsers(params: FindUserOptions): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async updateFields(id: number, fields: Prisma.UserUpdateInput) {
    return this.prisma.user.updateMany({ where: { id }, data: fields });
  }

  async updateJsonField(
    userId: number,
    updateData: Prisma.UserUpdateInput,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async comprehensiveUpdateMany(args: Prisma.UserUpdateManyArgs) {
    await this.prisma.user.updateMany(args);
  }

  async setJwtRefreshToken(
    usernameId: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { usernameId: usernameId },
      data,
    });
  }

  async disable2Fa(usernameId: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: { usernameId, recoveryKey: { not: null } },
      data: {
        twoFaSecret: null,
        is2FaVerified: false,
        backupCodes: [],
        recoveryKey: null,
      },
    });
  }

  async deleteUser(id: number): Promise<void> {
    await this.prisma.user.deleteMany({ where: { id } });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data: {
        ...data,
      },
    });
  }
}
