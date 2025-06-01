import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Base } from "./Base";
import { Session } from "./Session";
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { BadRequestException } from "@nestjs/common";
import uforge from "utils/forge";
import * as forge from "node-forge";
import { Follow } from "./Follow";
import { Post } from "./Post";
import { IFile } from "interfaces";
import { Attachment } from "./Attachment";

export const regexPaswword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?`~\-])[A-Za-z\d!@#$%^&*()_+\[\]{};':"\\|,.<>/?`~\-]{8,}$/;

@Entity()
export class User extends Base {
  @IsOptional()
  @IsEmail({}, { message: "user_email_is_not_valid" })
  @Column({ type: "varchar", unique: true, nullable: true })
  email: string;

  @IsOptional()
  @IsString({ message: "user_bio_is_not_valid" })
  @MaxLength(250, { message: "user_bio_is_not_valid" })
  @Column({ type: "text", nullable: true })
  bio: string;

  @ManyToOne(() => Attachment, (audio) => audio.userPhotos, {
    nullable: true,
    cascade: true,
  })
  photo: Attachment;

  @Matches(/^[a-zA-Z0-9_]{3,24}$/, { message: "user_username_is_not_valid" })
  @Column({ type: "varchar", unique: true })
  username: string;

  @IsString({ message: "user_name_is_not_valid" })
  @MaxLength(50, { message: "user_name_is_not_valid" })
  @MinLength(2, { message: "user_name_is_not_valid" })
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "json" })
  password: { hash: string } | { plain: string };

  @Column({ type: "json", default: {} })
  preferencies: { mode: "light" | "dark" | null };

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Session[];

  @OneToMany(() => Follow, (session) => session.me)
  iFollow: Follow[];

  @OneToMany(() => Follow, (session) => session.follow)
  theyFollow: Follow[];

  hashPassword() {
    if (this.password && "plain" in this.password) {
      if (!regexPaswword.test(this.password.plain)) {
        throw new BadRequestException("user_password_not_valid");
      }

      const hmac = forge.hmac.create();
      hmac.start("sha256", uforge.keys.private);
      hmac.update(this.password.plain);
      const digest = hmac.digest();
      const hash = forge.util.encode64(digest.bytes());

      this.password = { hash };
    }
  }

  verifyPassword(password: string) {
    if (!this.password) return false;
    if (!("hash" in this.password)) return;

    const hmac = forge.hmac.create();
    hmac.start("sha256", uforge.keys.private);
    hmac.update(password);
    const digest = hmac.digest();
    const hash = forge.util.encode64(digest.bytes());

    return hash === this.password.hash;
  }

  async _onSave_01() {
    this.hashPassword();
  }

  async _onSavesss() {
    const password = this.password as any as string;

    // if (typeof password === "string") {
    //   if (!regexPaswword.test(password)) {
    //     throw new BadRequestException("user_password_not_valid");
    //   }

    //   const pwd = uforge.encrypter(password);
    //   this.password = { value: pwd };
    // }
  }

  static comparePassword(password: string | string[], givenPassword: string) {
    if (!password) return false;

    const _password = uforge.decrypter(password);
    return _password === givenPassword;
  }
}
