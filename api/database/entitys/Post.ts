import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Base } from "./Base";
import { User } from "./User";
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { Attachment } from "./Attachment";

@Entity()
export class Post extends Base {
  @Column({ type: "uuid", unique: true, nullable: true })
  shareID: string;

  @IsOptional()
  @IsString({ message: "post_text_not_valid" })
  @Column({ type: "text", default: "" })
  text: string;

  @ManyToOne(() => Attachment, (audio) => audio.posts, {
    nullable: true,
    cascade: true,
  })
  audio: Attachment;

  @ManyToMany(() => Attachment, (attachment) => attachment.postFiles, {
    cascade: true,
  })
  @JoinTable()
  files: Attachment[];

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @ManyToOne(() => Post, (post) => post.responses, {
    nullable: true,
    onDelete: "SET NULL",
  })
  response: Post;

  @OneToMany(() => Post, (post) => post.response, {})
  responses: Post[];

  @Column({ type: "boolean", default: false })
  repost: boolean;

  nResponse: number;
  nRepost: number;
  hashtags: string[];
}
