import {
  Injectable,
  BadRequestException,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { User } from "database/entitys/User";
import { Reflector, REQUEST } from "@nestjs/core";
import { Request } from "express";
import { DataSource } from "typeorm";
import { Post } from "database/entitys/Post";
import { Follow } from "database/entitys/Follow";
import { SearchParams } from "meilisearch";
import { IFile, IHastag } from "interfaces";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";
import lodash, { orderBy, take } from "lodash";
import { Attachment } from "database/entitys/Attachment";
import { skip } from "rxjs";

@Injectable()
export class PostService {
  @Inject(REQUEST) readonly request: Request;
  @Inject() readonly reflector: Reflector;
  @Inject() dataSource: DataSource;

  async get() {
    const id = this.request.params.id;
    const post = await this.dataSource
      .getRepository(Post)
      .createQueryBuilder("post")

      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("user.photo", "photo")

      .leftJoinAndSelect("post.audio", "audio")
      .leftJoinAndSelect("post.files", "files")

      .leftJoinAndSelect("post.response", "response")
      .leftJoinAndSelect("response.user", "response_user")
      .leftJoinAndSelect("response_user.photo", "response_user_photo")
      .leftJoinAndSelect("response.audio", "response_audio")
      .leftJoinAndSelect("response.files", "response_files")

      .andWhere(`post.id = '${id}'`)
      .getOne();

    if (!post) throw new BadRequestException("post_not_found");

    return (await this.fill([post]))[0];
  }

  async share() {
    const id = this.request.params.id;
    const post = await this.dataSource
      .getRepository(Post)
      .createQueryBuilder("post")

      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("user.photo", "photo")

      .leftJoinAndSelect("post.audio", "audio")
      .leftJoinAndSelect("post.files", "files")

      .andWhere(`post.id = '${id}'`)
      .getOne();

    if (!post) throw new BadRequestException("post_not_found");

    return (await this.fill([post]))[0];
  }
  async addShare() {
    const user = this.request.session.user as User;
    const post = await this.get();

    if (post.user.id !== user.id) {
      throw new UnauthorizedException("not_authoriezd");
    }

    post.shareID = uuid();
    await post.save();

    return (await this.fill([post]))[0];
  }
  async removeShare() {
    const user = this.request.session.user as User;
    const post = await this.get();

    if (post.user.id !== user.id) {
      throw new UnauthorizedException("not_authoriezd");
    }

    post.shareID = null;
    await post.save();

    return (await this.fill([post]))[0];
  }

  async list() {
    const user = this.request.session.user as User;

    const pagination = {
      page: parseInt((this.request.query.page ?? 1).toString()),
      pageSize: parseInt((this.request.query.pageSize ?? 20).toString()),
    };

    const queryBuilder = this.dataSource
      .getRepository(Post)
      .createQueryBuilder("post")

      .leftJoinAndSelect("post.user", "user")
      .leftJoinAndSelect("user.photo", "photo")

      .leftJoinAndSelect("post.audio", "audio")
      .leftJoinAndSelect("post.files", "files")

      .leftJoinAndSelect("post.response", "response")
      .leftJoinAndSelect("response.user", "response_user")
      .leftJoinAndSelect("response_user.photo", "response_user_photo")
      .leftJoinAndSelect("response.audio", "response_audio")
      .leftJoinAndSelect("response.files", "response_files")

      .skip((pagination.page - 1) * pagination.page)
      .take(pagination.page)
      .orderBy("post.createdAt", "DESC");

    const searchFilters: string[] = [];
    const searchParams: SearchParams = { sort: ["createdAt:desc"], facets: [] };

    if (typeof this.request.query.user === "string") {
      queryBuilder.andWhere(`user.id = '${this.request.query.user}'`);
    }

    if (typeof this.request.query.responseTo === "string") {
      queryBuilder.andWhere(`response.id = '${this.request.query.responseTo}'`);
    }

    if (this.request.query.follow) {
      const follows = (
        await this.dataSource
          .getRepository(Follow)
          .createQueryBuilder("follow")
          .leftJoinAndSelect("follow.me", "follow_me")
          .leftJoinAndSelect("follow.follow", "follow_follow")
          .where(`follow_me.id = '${user.id}'`)
          .getMany()
      ).map((follow) => `'${follow.follow.id}'`);
      follows.push(`'${user.id}'`);

      queryBuilder.andWhere(`user.id IN (${follows.join(",")})`);
    }

    // if (typeof this.request.query.hashtag === "string") {
    //   const hashtag = this.request.query.hashtag.replaceAll("#", "");
    //   searchParams.facets.push(`hashtags = ${hashtag.toLowerCase()}`);
    //   // searchFilters.push(`text includes '#${hashtag}'`);
    // }

    // searchParams.filter = searchFilters.join(" AND ");
    searchParams.page = pagination.page;
    searchParams.hitsPerPage = pagination.pageSize;
    searchParams.sort = ["createdAt:desc"];

    // const result = await Meili.index("posts").search<Post>(
    //   (this.request.query.q as string) ?? null,
    //   searchParams,
    // );

    // if (result.hits.length) {
    //   queryBuilder
    //     .andWhere(
    //       `post.id IN (${result.hits.map((post) => `'${post.id}'`).join(",")})`,
    //     )
    //     .orderBy("post.createdAt", "DESC");
    // }

    const [posts, total] = await queryBuilder.getManyAndCount();

    return {
      ...pagination,
      data: await this.fill(posts),
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  private async fill(posts: Post[]) {
    const user = this.request.session.user as User;

    for (let i = 0; i < posts.length; i++) {
      delete posts[i].user.password;
      delete posts[i].response?.user.password;

      delete posts[i].response?.shareID;
      if (user?.id !== posts[i].user.id) delete posts[i].shareID;

      const reposnes = await this.dataSource
        .getRepository(Post)
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.response", "response")
        .leftJoinAndSelect("post.audio", "audio")
        .leftJoinAndSelect("post.files", "files")
        .where(`response.id = '${posts[i].id}'`)
        .getMany();

      posts[i].nResponse = reposnes.filter(
        (post) => post.text ?? post.audio ?? post.files.length,
      ).length;

      posts[i].nRepost = reposnes.filter(
        (post) => !post.text && !post.audio && !post.files.length,
      ).length;
    }

    return posts;
  }

  async add() {
    const params = this.request.body as {
      text: string;
      files: Attachment[];
      audio: Attachment;
    };
    const user = this.request.session.user as User;

    const post = new Post();
    post.user = user;
    post.text = params.text;
    post.files = [];

    // post.audio = params.audio;
    if (params.audio) {
      post.audio = this.dataSource
        .getRepository(Attachment)
        .create(params.audio);
      post.audio._allowedTypes = ["audio/webm"];
    }

    if (params.files) {
      for (const file of params.files) {
        const _file = this.dataSource.getRepository(Attachment).create(file);
        _file._allowedTypes = ["image/png", "image/jpeg", "image/webp"];
        post.files.push(_file);
      }
    }

    if (!params.text && !params.audio && !params.files?.length) {
      throw new BadRequestException("post_require_content");
    }

    if (this.request.body.response) {
      const _post = await this.dataSource
        .getRepository(Post)
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.user", "user")
        .andWhere(`post.id = '${this.request.body.response}'`)

        .getOne();

      if (!_post) throw new NotFoundException("post_not_found");
      post.response = _post;
    }

    await this.dataSource.manager.save(post);

    const fill = (await this.fill([post]))[0];
    await this.saveInMeili(fill);

    return fill;
  }

  async repost() {
    const user = this.request.session.user as User;

    const post = new Post();
    post.user = user;
    post.repost = true;

    if (!this.request.body.response) {
      throw new NotFoundException("post_not_found");
    }

    const _post = await this.dataSource
      .getRepository(Post)
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .andWhere(`post.id = '${this.request.body.response}'`)
      .getOne();

    if (!_post) throw new NotFoundException("post_not_found");
    post.response = _post;

    await this.dataSource.manager.save(post);

    const fill = (await this.fill([post]))[0];
    await this.saveInMeili(fill);

    return fill;
  }

  private async saveInMeili(post: Post) {
    function extraireHashtags(text: string) {
      const regex = /#[\p{L}\p{N}_]+/gu;
      const hashtags = [];
      let match: RegExpExecArray;

      while ((match = regex.exec(text)) !== null) {
        if (match[0]) {
          hashtags.push(match[0].replace("#", "").toLowerCase());
        }
      }
      return hashtags;
    }

    post.hashtags = extraireHashtags(post.text);
    delete post.audio;
    delete post.files;
    delete post.user.photo;

    delete post.response?.audio;
    delete post.response?.files;
    delete post.response?.user.photo;

    const re = /\#([A-Za-z0-1_]){1,}/gim;
    const matchies = post.text.match(re);

    if (matchies) {
      const date = dayjs(post.createdAt).format("DD-MM-YYYY");

      const names = matchies.map((m) => `'${m.replaceAll("#", "")}'`).join(",");

      const htags = await Meili.index<IHastag>("hashtags").search("", {
        filter: [`name IN [${names}]`],
      });

      for (const match of matchies) {
        let htag = htags.hits.find((h) => h.name === match.replaceAll("#", ""));

        if (!htag) {
          htag = {
            id: uuid(),
            name: match.replaceAll("#", ""),
            dates: {},
            n: 0,
          };
        }

        htag.dates[date] ??= 0;
        htag.dates[date]++;

        await Meili.index("hashtags").addDocuments([
          {
            id: htag.id,
            name: htag.name,
            dates: htag.dates,
            n: Object.values(htag.dates).reduce(
              (total, curr) => (total += curr),
            ),
          },
        ]);
      }
    }
  }

  async getHashtag() {
    const pagination = {
      page: parseInt((this.request.query.page ?? 1).toString()),
      pageSize: parseInt((this.request.query.pageSize ?? 20).toString()),
    };

    const today = dayjs().format("DD-MM-YYYY");

    const htags = await Meili.index<IHastag>("hashtags").search(
      (this.request.query.q as string) ?? null,
      {
        filter: this.request.query.q ? undefined : `dates.${today} EXISTS`,
        sort: ["n:desc"],
        page: pagination.page,
        hitsPerPage: pagination.pageSize,
      },
    );

    return {
      ...htags,
      ...pagination,
      data: htags.hits,
      total: htags.totalHits ?? htags.hits.length,
      totalPages: htags.totalPages ?? 0,
    };
  }

  async remove() {
    const user = this.request.session.user as User;
    const post = await this.get();

    if (post.user.id !== user.id) {
      throw new UnauthorizedException("not_authoriezd");
    }

    await post.remove();

    // supprimer le post dans la base de meilli
    await Meili.index("posts").deleteDocument(this.request.params.id);

    // récupérer tous les postes en réponse au poste supprimé
    const responses = await Meili.index<Post>("posts").getDocuments({
      filter: [`response.id = '${this.request.params.id}'`],
    });

    // enlver la réponse
    for (let i = 0; i < responses.results.length; i++) {
      delete responses.results[i].response;
    }

    // enregistrer
    await Meili.index<Post>("posts").addDocuments(responses.results);
  }
}
