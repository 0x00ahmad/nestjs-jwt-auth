// import {
//   INestApplication,
//   Injectable,
//   OnModuleDestroy,
//   OnModuleInit,
// } from "@nestjs/common";
// import { PrismaClient } from "@prisma/client";
//
// @Injectable()
// export class PrismaService
//   extends PrismaClient
//   implements OnModuleInit, OnModuleDestroy {
//   constructor() {
//     super({
//       datasources: {
//         db: {
//           url: process.env.DATABASE_URL,
//         },
//       },
//     });
//   }
//
//   async onModuleInit() {
//     await this.$connect();
//   }
//
//   async onModuleDestroy() {
//     await this.$disconnect();
//   }
//
//   async enableShutdownHooks(app: INestApplication) {
//     this.$on("", async () => {
//       await app.close();
//     });
//   }
// }

import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
