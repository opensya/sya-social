import { Controller, Get, Inject, Post } from "@nestjs/common";
import { SessionService } from "./session.service";
import { DontNeedSession, Public } from "interceptors/public";

@Controller({ path: "/session" })
export class SessionController {
  @Inject() private readonly service: SessionService;

  @DontNeedSession()
  @Public()
  @Post("/init")
  async init() {
    return await this.service.init();
  }

  @Public()
  @Post("/register")
  async register() {
    return await this.service.register();
  }

  @Public()
  @Post("/login")
  async login() {
    return await this.service.login();
  }

  @Public()
  @Post("/request-password-reset")
  async requestPasswordReset() {
    return await this.service.requestPasswordReset();
  }

  @Public()
  @Post("/reset-password")
  async resetPassword() {
    return await this.service.resetPassword();
  }

  @Post("/logout")
  async logout() {
    return await this.service.logout();
  }
}
