import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authServie: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivated(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // Ignorer certaines routes en fonction de la condition (exemple : route 'public')
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler(),
    );
    if (isPublic) {
      return true; // Sauter l'authentification si la route est publique
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return false;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path.replace(/^\//, "");

    /** récupération de l'utilisateur connecté */
    const token = this.extractTokenFromHeader(request);
    if (token) {
      const { session } = await this.authServie.verifyToken(token);
      request.session = session;

      if (session?.closed) throw new ForbiddenException("session_closed");
    }

    const isPublic = this.reflector.get<boolean>(
      "IS_PUBLIC",
      context.getHandler(),
    );

    const dontNeedSession = this.reflector.get<boolean>(
      "DONT_NEED_SESSION",
      context.getHandler(),
    );

    if (!dontNeedSession && !request.session) {
      throw new ForbiddenException("need_session");
    }

    if (!isPublic && !request.session?.user) {
      throw new ForbiddenException("need_logged");
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | null {
    const authorization = request.headers["authorization"];
    if (!authorization) {
      return null;
    }

    const parts = authorization.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }
}
