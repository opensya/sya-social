import { Controller, Delete, Get, Inject, Post } from "@nestjs/common";
import { PostService } from "./post.service";

@Controller({ path: "/post" })
export class PostController {
  @Inject() private readonly service: PostService;

  @Get("/hashtag")
  async hashtag() {
    return await this.service.getHashtag();
  }

  @Get("/:id")
  async get() {
    return await this.service.get();
  }

  @Get("/")
  async list() {
    return await this.service.list();
  }

  @Post("/")
  async add() {
    return await this.service.add();
  }
  @Post("/repost")
  async repost() {
    return await this.service.repost();
  }

  @Delete("/:id")
  async remove() {
    return await this.service.remove();
  }
}
