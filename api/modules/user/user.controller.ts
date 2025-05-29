import { Controller, Delete, Get, Inject, Post } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller({ path: "/user" })
export class UserController {
  @Inject() private readonly service: UserService;

  @Get("/@:username")
  async get() {
    return await this.service.get();
  }

  @Post("/@:username/follow")
  async follow() {
    return await this.service.follow.follow();
  }
  @Delete("/@:username/follow")
  async unfollow() {
    return await this.service.follow.unfollow();
  }
  @Get("/@:username/follow/i")
  async follow_iam() {
    return await this.service.follow.iam();
  }
  @Get("/@:username/follow/list/:side")
  async follow_list() {
    return await this.service.follow.list();
  }
  @Get("/@:username/follow/n")
  async follow_n() {
    return await this.service.follow.nFollows();
  }

  @Get("/tofollow")
  async tofollow() {
    return await this.service.tofollow();
  }

  @Post("/update/profile")
  async updateProfile() {
    return await this.service.updateProfile();
  }

  @Post("/update/password")
  async updatePassword() {
    return await this.service.updatePassword();
  }

  @Get("/@:username/n-posts")
  async nPost() {
    return await this.service.nPosts();
  }
}
