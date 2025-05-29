import dotenv from "dotenv";
dotenv.config({ path: process.env.DOT_ENV_PATH || ".env" });

global.isProduction =
  process.env.NODE_ENV === "production" || process.env.ENV === "production";

global.API_URL = process.env.API_URL;
global.CLIENT_URL = process.env.CLIENT_URL;

import { version } from "./package.json";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { json } from "express";
import { Logger } from "@nestjs/common";

import utils from "utils/forge";
import { HttpExceptionFilter } from "interceptors/interceptor";
import { services } from "interceptors/isService";
import { createDatabaseIfNotExists } from "database";
import sender from "mail/sender";
import { MeiliSearch } from "meilisearch";

async function bootstrap() {
  utils.generate();
  await createDatabaseIfNotExists();

  global.Meili = new MeiliSearch({
    host: `http://127.0.0.1:${process.env.MEILISEARCH_PORT}`,
    apiKey: process.env.MEILISEARCH_API_KEY,
  });

  const app = await NestFactory.create(AppModule, { cors: { origin: "*" } });

  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(json({ limit: "50mb" }));

  global.PORT = process.env.PORT ? parseInt(process.env.PORT) : 11500;

  await app.listen(process.env.PORT || 11500);

  Logger.log(`port: ${PORT}`);
  Logger.log(`version: ${version}`);
  Logger.log(`url: ${API_URL}`);

  // sender({ to: "mamadou@domutala.com", text: "hello" });
}

bootstrap();
