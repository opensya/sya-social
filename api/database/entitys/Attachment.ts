import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  IsBase64,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Validate,
  validate,
  ValidateBy,
} from "class-validator";
import { BadRequestException } from "@nestjs/common";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
export class Attachment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsString({ message: "attachment_name_must_be_string" })
  @Column({ type: "varchar" })
  name: string;

  @IsString({ message: "attachment_type_not_allow" })
  @IsIn(Attachment.allowedTypes, { message: "attachment_type_not_allow" })
  @Column({ type: "varchar" })
  type: string;

  @IsInt({ message: "attachment_size_must_be_int" })
  @Column({ type: "int" })
  size: number;

  @IsOptional()
  @IsBase64({}, { message: "attachment_content_must_be_base64" })
  @Column({ type: "text" })
  content: string;

  @Column({ type: "boolean", default: true })
  _FILE_: boolean;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.audio, { onDelete: "CASCADE" })
  posts: Post[];

  @ManyToMany(() => Post, (post) => post.files, { onDelete: "CASCADE" })
  postFiles: Post[];

  @OneToMany(() => User, (user) => user.photo, { onDelete: "CASCADE" })
  userPhotos: User[];

  _allowedTypes?: string[];

  @BeforeInsert()
  @BeforeUpdate()
  async onSave() {
    this._FILE_ = true;
    this.content = this.content.split("base64,")[1];

    const errors = await validate(this);
    if (errors.length) {
      throw new BadRequestException(
        errors
          .map((error) => Object.values(error.constraints).join(";"))
          .join(";"),
      );
    }

    const type = Attachment.detectMimeType(this.content);
    if (type !== this.type) {
      throw new BadRequestException(["attachment_type_not_valid"]);
    }

    if (this._allowedTypes && !this._allowedTypes.includes(this.type)) {
      throw new BadRequestException(["attachment_type_not_allow"]);
    }
  }

  static detectMimeType(base64: string): string {
    function base64ToUint8Array(base64: string): Uint8Array {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }

    const bytes = base64ToUint8Array(base64);

    // PNG
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return "image/png";
    }

    // JPEG
    if (
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[bytes.length - 2] === 0xff &&
      bytes[bytes.length - 1] === 0xd9
    ) {
      return "image/jpeg";
    }

    // GIF87a ou GIF89a
    if (
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38 &&
      (bytes[4] === 0x37 || bytes[4] === 0x39) &&
      bytes[5] === 0x61
    ) {
      return "image/gif";
    }

    // PDF
    if (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    ) {
      return "application/pdf";
    }

    // WEBP
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return "image/webp";
    }

    // WebM (audio ou vidéo) - EBML Header: 1A 45 DF A3
    if (
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3
    ) {
      return "audio/webm"; // ou "video/webm" si nécessaire
    }

    return "unknow";
  }

  static getBase64Size(base64: string): number {
    // Supprimer les caractères de padding '='
    const cleanedBase64 = base64.replace(/=+$/, "");
    const length = cleanedBase64.length;

    // Chaque caractère Base64 représente 6 bits, soit 3 octets pour 4 caractères
    return Math.floor((length * 3) / 4);
  }

  static allowedTypes = ["image/png", "image/jpeg", "image/webp", "audio/webm"];
}
