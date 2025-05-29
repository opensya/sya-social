import {
  BaseEntity,
  PrimaryColumn,
  BeforeInsert,
  BeforeUpdate,
  Column,
  SelectQueryBuilder,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { isBase64, IsUUID, validate } from "class-validator";
import { BadRequestException } from "@nestjs/common";
import { Fyle } from "./Fyle";

export interface _SaveOptions {
  notSave?: boolean;
}

export interface _FindOptions<T = any> {
  [x: string]: any;

  _pagination?: { page: number; pageSize?: number };

  _findOptions?: {
    [key: string]: any;
    beforeFind?: (queryBuilder: SelectQueryBuilder<any>) => void;
    join?: (string | [string, string])[];
  };
}

export class Base extends BaseEntity {
  generateId() {
    this.id = uuidv4();
    return this.id;
  }

  @IsUUID()
  @PrimaryColumn({ type: "uuid", nullable: false })
  id!: string;

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

  @BeforeInsert()
  onInsert() {
    if (!this.id) this.id = uuidv4();

    // this.createdAt = new Date();
    // this.updatedAt = new Date();
  }

  @BeforeInsert()
  @BeforeUpdate()
  async onSave() {
    // this.updatedAt = new Date();
    await this._validate();
    // await this._saveFyle(this);

    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter((method) => /^_onSave_\d+$/.test(method)) // Filtrer les méthodes _onSave_<number>
      .sort((a, b) => {
        // Trier en fonction du numéro après _onSave_
        const numA = parseInt(a.split("_").pop()!, 10);
        const numB = parseInt(b.split("_").pop()!, 10);
        return numA - numB;
      });

    for (const method of methods) {
      await (this as any)[method]();
    }
  }

  async _saveFyle(obj?: { [key: string]: any }) {
    async function _decrypter(datas: any) {
      if (!datas) {
        // ne rien faire
      } else if (Array.isArray(datas)) {
        for (let i = 0; i < datas.length; i++) {
          datas[i] = await _decrypter(datas[i]);
        }
      } else if (Object.prototype.toString.call(datas) === "[object Object]") {
        if (
          "content" in datas &&
          typeof datas.content === "string" &&
          (isBase64(datas.content) || datas.content.includes(";base64,"))
        ) {
          if (!datas.id) {
            datas.content = datas.content.split("base64,")[1];
            const fyle = new Fyle();
            fyle.name = datas.name;
            fyle.size = datas.size;
            fyle.type = datas.type;
            fyle.content = datas.content;
            datas = await fyle.save();

            delete datas.content;
          }
        } else {
          for (const key in datas) {
            datas[key] = await _decrypter(datas[key]);
          }
        }
      }

      return datas;
    }

    return await _decrypter(obj);
  }

  async _validate() {
    const errors = await validate(this);
    if (errors.length) {
      throw new BadRequestException(
        errors
          .map((error) => Object.values(error.constraints).join(";"))
          .join(";"),
      );
    }
  }
}
