import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import forge from "utils/forge";
import { Session } from "database/entitys/Session";
import jwt from "utils/jwt";
import { User } from "database/entitys/User";
import { readFileSync } from "fs";
import { join } from "path";
import sender from "mail/sender";
import { Reflector, REQUEST } from "@nestjs/core";
import { Request } from "express";
import { DataSource } from "typeorm";

@Injectable()
export class SessionService {
  @Inject(REQUEST) readonly request: Request;
  @Inject() readonly reflector: Reflector;
  @Inject() dataSource: DataSource;

  async init() {
    if (!this.request.session) {
      const params = this.request.body;
      const publicKey = params.publicKey;

      if (!params.publicKey) {
        throw new BadRequestException("publicKey_required");
      }

      const session = new Session();
      session.publicKey = publicKey;

      this.request.session = await session.save();

      return this.getSessionValues();
    }

    return this.getSessionValues();
  }

  async register() {
    const params = this.request.body as {
      password: string;
      username: string;
      name: string;
      email: string;
    };

    if (this.request.session?.user) {
      throw new ConflictException("not_authorized");
    }

    const u = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .where(`username = '${params.username}'`)
      .getOne();

    if (u) throw new BadRequestException("username_is_already_taken");

    if (params.email) {
      const uEmail = await this.dataSource
        .getRepository(User)
        .createQueryBuilder("user")
        .where(`email = '${params.email}'`)
        .getOne();
      if (uEmail) {
        throw new BadRequestException("user_with_this_email_alredy_exists");
      }
    }

    const user = new User();
    user.username = params.username;
    user.email = params.email;
    user.name = params.name;
    user.password = { plain: params.password };

    await user.save();

    this.request.session = await this.dataSource
      .getRepository(Session)
      .save({ id: this.request.session.id, user });

    delete user.password;
    await Meili.index("user").addDocuments([user]);

    return this.getSessionValues();
  }

  async login() {
    const params = this.request.body as {
      username: string;
      password: string;
    };
    if (this.request.session?.user) {
      throw new ConflictException("not_authorized");
    }

    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .where(`user.username = '${params.username}'`)
      .orWhere(`user.email = '${params.username}'`)
      .getOne();

    if (!user) throw new BadRequestException("username_or_password_incorect");

    if (!user.verifyPassword(params.password)) {
      throw new BadRequestException("username_or_password_incorect");
    }

    this.request.session = await this.dataSource
      .getRepository(Session)
      .save({ id: this.request.session.id, user });

    return this.getSessionValues();
  }

  private getSessionValues() {
    const _user = this.request.session.user;
    if (_user) {
      delete _user.password;
    }

    return {
      sessionId: { _RSA_ENCODED_: this.request.session.id },
      apiPublicKey: forge.keys.public,
      user: _user,
    };
  }

  async logout() {
    await this.dataSource
      .getRepository(Session)
      .save({ id: this.request.session.id, closed: true });

    return { token: this.request.session.id };
  }

  async requestPasswordReset() {
    const params = this.request.body as { username: string };
    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .where(`user.username = '${params.username}'`)
      .orWhere(`user.email = '${params.username}'`)
      .getOne();
    if (!user) throw new NotFoundException("user_not_found");

    const url =
      CLIENT_URL +
      "/session/reset-password?token=" +
      jwt.sign(
        { username: user.username, action: "reset-password" },
        { expiresIn: "30m" },
      );

    const mail = readFileSync(
      join(process.cwd(), "mail/resetPassword.html"),
      "utf8",
    )
      .replace("{{ name }}", user.name ? ` ${user.name}` : "")
      .replace("{{ resetLink }}", url);

    await sender({
      html: mail,
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
    });

    return {};
  }

  async resetPassword() {
    const params = this.request.body as {
      token: string;
      code: string;
      password: string;
    };
    let user: User;

    try {
      const token = jwt.verify(params.token) as {
        username: string;
        action: string;
      };

      if (token.action !== "reset-password") throw "";

      user = await this.dataSource
        .getRepository(User)
        .createQueryBuilder("user")
        .andWhere(`user.username = '${token.username}'`)
        .getOne();

      if (!user) throw "";
    } catch (error) {
      throw new BadRequestException("invalid_token");
    }

    user.password = { plain: params.password };
    await user.save();

    this.request.session = await this.dataSource
      .getRepository(Session)
      .save({ id: this.request.session.id, user });

    return this.getSessionValues();
  }
}
