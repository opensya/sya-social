import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";
import {
  isBase64,
  IsBase64,
  IsInt,
  IsOptional,
  IsString,
  isUUID,
  validate,
} from "class-validator";
import { v4 as uuidv4 } from "uuid";
import { BadRequestException } from "@nestjs/common";
import { IFile } from "interfaces";

@Entity()
export class Fyle extends BaseEntity {
  @PrimaryColumn({ type: "uuid", nullable: false })
  id!: string;

  @IsString({ message: "fyle_name_must_be_string" })
  @Column({ type: "varchar" })
  name: string;

  @IsString({ message: "fyle_type_must_be_string" })
  @Column({ type: "varchar" })
  type: string;

  @IsInt({ message: "fyle_size_must_be_int" })
  @Column({ type: "int" })
  size: number;

  @IsOptional()
  @IsBase64({}, { message: "fyle_content_must_be_base64" })
  @Column({ type: "text" })
  content: string;

  @Column({ type: "boolean", default: true })
  _FILE_: boolean;

  @Column({ type: "timestamp" })
  createdAt: Date;

  @Column({ type: "timestamp" })
  updatedAt: Date;

  @BeforeInsert()
  onInsert() {
    if (!this.id) this.id = uuidv4();

    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  @BeforeUpdate()
  async onSave() {
    this.updatedAt = new Date();

    const errors = await validate(this);
    if (errors.length) {
      throw new BadRequestException(
        errors
          .map((error) => Object.values(error.constraints).join(";"))
          .join(";"),
      );
    }
  }

  static isValid(
    file: IFile,
    options: { accept?: string[]; maxSize?: number } = {},
  ) {
    if (typeof file.name !== "string") return false;
    if (typeof file.type !== "string") return false;
    if (typeof file.size !== "number") return false;

    // if (!file.content) return false;
    if (file.id && !isUUID(file.id)) return false;

    const notValidKey = Object.keys(file).filter(
      (k) => !["id", "name", "size", "url", "content", "_FILE_"].includes(k),
    );

    if (notValidKey.length) return false;

    return true;
  }
}
