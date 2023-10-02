import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: ["log", "debug", "warn", "verbose"] },
  );
  app.useGlobalPipes(new ValidationPipe());
  const _port = process.env.PORT || 8000;
  await app.listen(_port, "0.0.0.0", (_, uri) => {
    console.log(`Server Listening at ${uri} 👍`);
  });
}

bootstrap();
