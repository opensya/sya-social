import { Injectable, Inject } from "@nestjs/common";
import { Session } from "database/entitys/Session";
import { DataSource } from "typeorm";

@Injectable()
export class AuthService {
  @Inject() dataSource: DataSource;

  async verifyToken(token: string) {
    const session = await this.dataSource
      .getRepository(Session)
      .createQueryBuilder("session")
      .leftJoinAndSelect("session.user", "user")
      .where(`session.id = '${token}'`)
      .getOne();

    return { session };
  }
}
