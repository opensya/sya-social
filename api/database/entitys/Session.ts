import { Column, Entity, ManyToOne } from "typeorm";
import { Base } from "./Base";
import { User } from "./User";

@Entity()
export class Session extends Base {
  @Column({ type: "boolean", default: false })
  closed: boolean;

  @Column({ type: "text" })
  publicKey: string;

  @Column({ type: "text", nullable: true })
  jeton: string;

  @ManyToOne(() => User, (user) => user.sessions)
  user: User;
}
