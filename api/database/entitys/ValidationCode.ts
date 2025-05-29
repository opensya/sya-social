import { Column, Entity } from "typeorm";
import { Base } from "./Base";

@Entity()
export class ValidationCode extends Base {
  @Column({ type: "varchar", unique: true })
  code: string;

  @Column({ type: "text" })
  action: string;
}
