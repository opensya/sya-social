import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  OnApplicationBootstrap,
  Param,
  Query,
  Res,
  StreamableFile,
} from "@nestjs/common";
import { Response } from "express";
import {
  createReadStream,
  existsSync,
  readdirSync,
  rmSync,
  statSync,
} from "fs";
import { join } from "path";
import forge from "utils/forge";
import dayjs from "dayjs";
import { DataSource } from "typeorm";
import jwt from "utils/jwt";
import { Fyle } from "database/entitys/Fyle";
import { Readable } from "typeorm/platform/PlatformTools";
import { version, name } from "./package.json";
import { DontNeedSession, Public } from "interceptors/public";
import { Attachment } from "database/entitys/Attachment";

@Controller({ path: "/" })
export class AppController {
  @Inject() dataSource: DataSource;

  @Public()
  @DontNeedSession()
  @Get("/attachment/:token")
  async file(
    @Param("token") token: string,
    @Query("attachment") attachment: string,
    @Res() res: Response,
  ) {
    let id: string;
    try {
      id = jwt.verify(token) as string;
    } catch (error) {
      throw new NotFoundException("fattachment_not_found");
    }

    if (!id) throw new NotFoundException("attachment_not_found");

    let $attachement: Attachment;

    try {
      $attachement = await this.dataSource
        .getRepository(Attachment)
        .createQueryBuilder("attachment")
        .andWhere("attachment.id = :id", { id })
        .getOneOrFail();
    } catch (error) {
      throw new NotFoundException("attachment_not_found");
    }

    if (!$attachement?.content)
      throw new NotFoundException("attachment_not_found");

    let content = $attachement.content;
    if (content.includes("base64,")) content = content.split("base64,")[1];

    const buffer = Buffer.from(content, "base64");
    const stream = Readable.from(buffer);

    // Définissez le type de contenu et l'en-tête de disposition du contenu
    res.setHeader("Content-Type", $attachement.type);
    res.setHeader("Content-Length", Buffer.byteLength(buffer));
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Content-Disposition",
      `${attachment ? "attachment" : "inline"}; filename="${$attachement.name}"`,
    );

    stream.pipe(res);
  }

  @Get()
  ping() {
    return {
      name,
      version,
      env: isProduction,
    };
  }
}
