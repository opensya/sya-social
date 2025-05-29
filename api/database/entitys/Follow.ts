import { Column, Entity, ManyToOne } from "typeorm";
import { Base } from "./Base";
import { User } from "./User";

@Entity()
export class Follow extends Base {
  @ManyToOne(() => User, (user) => user.iFollow)
  me: User;

  @ManyToOne(() => User, (user) => user.theyFollow)
  follow: User;
}
