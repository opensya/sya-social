/* eslint-disable no-var */

import { Request, Express } from "express";
import { Session } from "database/entitys/Session";
import { User } from "database/entitys/User";
import type { auth } from "firebase-admin";
import { MeiliSearch, Meilisearch } from "meilisearch";
import { Data } from "database/entitys/Data";
import * as Typesense from "typesense";

export declare global {
  namespace Express {
    interface Request<ReqBody = { test: boolean }> {
      user: { uid: string; email: string };
      session: Session;

      body: {
        service: string[];
        function: string[];
        [key: string]: any;
      };

      data: {
        service: string[];
        params: {
          data: any;
          [key: string]: any;
        };
        [key: string]: any;
      };
    }
  }

  // var clientConfig: Config;
  var isProduction: boolean;
  var PORT: number;
  var API_URL: string;
  var CLIENT_URL: string;

  var Meili: MeiliSearch;
}

declare module "../database/entitys/User.ts" {
  interface User {
    srhUser: Data<{ active?: boolean; access: string[]; [key: string]: any }>;
  }
}
