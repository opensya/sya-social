import { Column, Entity } from "typeorm";
import { Base } from "./Base";
import { Options } from "@tarico/form";

@Entity()
export class Model extends Base {
  @Column({ type: "varchar", unique: true })
  code: string;

  @Column({ type: "text" })
  datatext: string;

  data: Options;
}
