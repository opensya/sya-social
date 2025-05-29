import {
  ArgumentsHost,
  CallHandler,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { map, Observable } from "rxjs";
import forge from "utils/forge";
import jwt from "utils/jwt";

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  constructor() {}

  private fyleDecrypter(obj?: { [key: string]: any }) {
    function _decrypter(datas: any) {
      if (!datas) {
        // ne rien faire
      } else if (Array.isArray(datas)) {
        for (let i = 0; i < datas.length; i++) {
          datas[i] = _decrypter(datas[i]);
        }
      } else if (Object.prototype.toString.call(datas) === "[object Object]") {
        if ("_FILE_" in datas) datas = datas._FILE_;
        else {
          for (const key in datas) {
            datas[key] = _decrypter(datas[key]);
          }
        }
      }

      return datas;
    }

    return _decrypter(obj);
  }

  private linkFyle(obj?: { [key: string]: any }) {
    function _decrypter(datas: any) {
      if (!datas) {
        // ne rien faire
      } else if (Array.isArray(datas)) {
        for (let i = 0; i < datas.length; i++) {
          datas[i] = _decrypter(datas[i]);
        }
      } else if (Object.prototype.toString.call(datas) === "[object Object]") {
        if (datas._FILE_) {
          datas.url = `${API_URL}/attachment/${jwt.sign(datas.id, {})}`;
          delete datas.content;
        } else {
          for (const key in datas) {
            datas[key] = _decrypter(datas[key]);
          }
        }
      }

      return datas;
    }

    return _decrypter(obj);
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.data) {
      request.data = this.fyleDecrypter(decrypter(request.data));
    }

    function decrypter(obj?: { [key: string]: any }) {
      function _decrypter(datas: any) {
        if (!datas) {
          // ne rien faire
        } else if (Array.isArray(datas)) {
          for (let i = 0; i < datas.length; i++) {
            datas[i] = _decrypter(datas[i]);
          }
        } else if (
          Object.prototype.toString.call(datas) === "[object Object]"
        ) {
          if ("_RSA_ENCODED_" in datas) {
            datas = forge.decrypter(datas._RSA_ENCODED_);
          } else {
            for (const key in datas) {
              datas[key] = _decrypter(datas[key]);
            }
          }
        }

        return datas;
      }

      return _decrypter(obj);
    }

    function encrypter(obj?: { [key: string]: any }) {
      const _encrypter = (datas: any) => {
        if (!datas) {
          // ne rien faire
        } else if (Array.isArray(datas)) {
          for (let i = 0; i < datas.length; i++) {
            datas[i] = _encrypter(datas[i]);
          }
        } else if (
          Object.prototype.toString.call(datas) === "[object Object]"
        ) {
          if ("_RSA_ENCODED_" in datas) {
            if (request.session.publicKey) {
              datas._RSA_ENCODED_ = forge.encrypter(
                datas._RSA_ENCODED_,
                request.session.publicKey,
              );
            } else datas = null;
          } else {
            for (const key in datas) {
              datas[key] = _encrypter(datas[key]);
            }
          }
        }

        return datas;
      };

      return _encrypter(obj);
    }

    return next.handle().pipe(
      map((data) => {
        if (request.session) data = encrypter(data);
        data = this.linkFyle(data);

        return { _RESPONSE_: data };
      }),
      // catchError((error) => {
      //   return this._throwError(error);
      // }),
    );
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.message || "internal_error";

    if (!isProduction) Logger.error(message);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message.split(";"),
    });
  }
}
