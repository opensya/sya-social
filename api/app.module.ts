import { Inject, Module, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigDatabase } from "database";
import { AppController } from "./app.controller";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { GlobalInterceptor } from "interceptors/interceptor";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { DataSource } from "typeorm";
import { SessionModule } from "modules/session/session.module";
import { UserModule } from "modules/user/user.module";
import { PostModule } from "modules/post/post.module";
import entitys from "database/entitys";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.DOT_ENV_PATH || ".env",
    }),
    TypeOrmModule.forRoot({ ...ConfigDatabase(), autoLoadEntities: true }),
    TypeOrmModule.forFeature(entitys),

    AuthModule,
    SessionModule,
    UserModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: GlobalInterceptor },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  @Inject() dataSource: DataSource;

  async onApplicationBootstrap() {
    // await mock();
    await this.initMeili();
  }

  async initMeili() {
    await Meili.createIndex("users", { primaryKey: "id" });
    await Meili.index("users").updateFilterableAttributes([
      "id",
      "createdAt",
      "username",
      "name",
    ]);
    await Meili.index("users").updateSortableAttributes(["createdAt"]);

    await Meili.createIndex("posts", { primaryKey: "id" });
    await Meili.index("posts").updateFilterableAttributes([
      "id",
      "createdAt",
      "text",
      // {
      //   attributePatterns: ["text"],
      //   features: {
      //     facetSearch: true,
      //     filter: { equality: true, comparison: true },
      //   },
      // },
      "user.id",
      "response.id",
      "hashtags",
    ]);
    await Meili.index("posts").updateSortableAttributes(["createdAt"]);

    await Meili.createIndex("hashtags", { primaryKey: "id" });
    await Meili.index("hashtags").updateFilterableAttributes([
      "id",
      "name",
      "dates",
    ]);
    await Meili.index("hashtags").updateSortableAttributes([
      "name",
      "n",
      "dates",
    ]);

    await Meili.httpRequest.patch({
      path: "/experimental-features/",
      body: { containsFilter: true },
    });

    // const posts = await this.dataSource
    //   .getRepository(Post)
    //   .createQueryBuilder("post")
    //   .leftJoinAndSelect("post.user", "user")
    //   .leftJoinAndSelect("post.response", "response")
    //   .leftJoinAndSelect("response.user", "response_user")
    //   .getMany();

    // for (let i = 0; i < posts.length; i++) {
    //   delete posts[i].user.password;
    //   delete posts[i].response?.user.password;

    //   function extraireHashtags(text: string) {
    //     const regex = /#[\p{L}\p{N}_]+/gu;
    //     const hashtags = [];
    //     let match: RegExpExecArray;
    //     while ((match = regex.exec(text)) !== null) {
    //       if (match[0]) {
    //         hashtags.push(match[0].replace("#", "").toLowerCase());
    //       } // normalisation en minuscules
    //     }
    //     // console.log(hashtags);
    //     return hashtags;
    //   }

    //   posts[i].hashtags = extraireHashtags(posts[i].text);
    // }

    // // await Meili.createIndex("posts", { primaryKey: "id" });
    // await Meili.index("posts").addDocuments(posts);
  }
}
