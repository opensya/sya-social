import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { User } from "database/entitys/User";
import { Reflector, REQUEST } from "@nestjs/core";
import { Request } from "express";
import { DataSource } from "typeorm";
import { Follow } from "database/entitys/Follow";
import { IFile } from "interfaces";
import { Post } from "database/entitys/Post";
import { Attachment } from "database/entitys/Attachment";

@Injectable()
export class UserService {
  @Inject(REQUEST) readonly request: Request;
  @Inject() readonly reflector: Reflector;
  @Inject() dataSource: DataSource;

  async get() {
    const username = this.request.params.username;
    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.photo", "photo")
      .andWhere(`username = '${username}'`)
      .getOne();

    if (!user) throw new BadRequestException("user_not_found");

    delete user.password;

    return user;
  }

  follow = {
    list: async () => {
      const pagination = {
        page: parseInt((this.request.query.page ?? 1).toString()),
        pageSize: parseInt((this.request.query.pageSize ?? 20).toString()),
      };

      const user = await this.get();

      let follows: Follow[] = [];
      let total = 0;

      const queryBuilder = this.dataSource
        .getRepository(Follow)
        .createQueryBuilder("follow")

        .leftJoinAndSelect("follow.me", "follow_me")
        .leftJoinAndSelect("follow_me.photo", "follow_me_photo")

        .leftJoinAndSelect("follow.follow", "follow_follow")
        .leftJoinAndSelect("follow_follow.photo", "follow_follow_photo");

      if (this.request.params.side === "i") {
        queryBuilder.andWhere(`follow_me.id = '${user.id}'`);
      } else {
        queryBuilder.andWhere(`follow_follow.id = '${user.id}'`);
      }

      queryBuilder
        .skip((pagination.page - 1) * pagination.page)
        .take(pagination.pageSize);

      if (this.request.query.q) {
        const result = await Meili.index("users").search<User>(
          this.request.query.q as string,
        );

        if (result.hits.length) {
          const ids = result.hits.map((user) => `'${user.id}'`).join(",");

          if (this.request.params.side === "i") {
            queryBuilder.andWhere(`follow_follow.id IN (${ids})`);
          } else {
            queryBuilder.andWhere(`follow_me.id IN (${ids})`);
          }

          [follows, total] = await queryBuilder.getManyAndCount();
        }
      } else {
        [follows, total] = await queryBuilder.getManyAndCount();
      }

      for (let i = 0; i < follows.length; i++) {
        delete follows[i].me.password;
        delete follows[i].follow.password;
      }

      return {
        ...pagination,
        data: follows,
        total,
        totalPages: total ? Math.ceil(total / pagination.pageSize) : 0,
      };
    },

    nFollows: async () => {
      const user = await this.get();

      return {
        followings: await this.dataSource
          .getRepository(Follow)
          .createQueryBuilder("follow")
          .andWhere(`follow_me.id = '${user.id}'`)
          .leftJoinAndSelect("follow.me", "follow_me")
          .getCount(),

        followers: await this.dataSource
          .getRepository(Follow)
          .createQueryBuilder("follow")
          .leftJoinAndSelect("follow.follow", "follow_follow")
          .andWhere(`follow_follow.id = '${user.id}'`)
          .getCount(),
      };
    },

    follow: async () => {
      const user = await this.get();
      const me = this.request.session.user as User;

      let follow = await this.dataSource
        .getRepository(Follow)
        .createQueryBuilder("user")

        .leftJoinAndSelect("user.me", "me")
        .leftJoinAndSelect("me.photo", "me_photo")

        .leftJoinAndSelect("user.follow", "follow")
        .leftJoinAndSelect("follow.photo", "follow_photo")

        .andWhere(`me.id = '${me.id}'`)
        .andWhere(`follow.id = '${user.id}'`)
        .getOne();

      if (!follow) {
        follow = new Follow();
        follow.me = me;
        follow.follow = user;

        await follow.save();
      }

      delete follow.me.password;
      delete follow.follow.password;

      return follow;
    },

    unfollow: async () => {
      const user = await this.get();
      const me = this.request.session.user as User;

      const follow = await this.dataSource
        .getRepository(Follow)
        .createQueryBuilder("user")

        .leftJoinAndSelect("user.me", "me")
        .leftJoinAndSelect("me.photo", "me_photo")

        .leftJoinAndSelect("user.follow", "follow")
        .leftJoinAndSelect("follow.photo", "follow_photo")

        .andWhere(`me.id = '${me.id}'`)
        .andWhere(`follow.id = '${user.id}'`)
        .getOne();

      if (follow) {
        await follow.remove();

        delete follow.me.password;
        delete follow.follow.password;
      }

      return follow;
    },

    iam: async () => {
      const user = await this.get();
      const me = this.request.session.user as User;

      const follow = await this.dataSource
        .getRepository(Follow)
        .createQueryBuilder("user")

        .leftJoinAndSelect("user.me", "me")
        .leftJoinAndSelect("me.photo", "me_photo")

        .leftJoinAndSelect("user.follow", "follow")
        .leftJoinAndSelect("follow.photo", "follow_photo")

        .andWhere(`me.id = '${me.id}'`)
        .andWhere(`follow.id = '${user.id}'`)
        .getOne();

      delete follow?.me?.password;
      delete follow?.follow?.password;

      return follow;
    },
  };

  async tofollow() {
    const user = this.request.session.user as User;
    const pagination = {
      page: parseInt((this.request.query.page ?? 1).toString()),
      pageSize: parseInt((this.request.query.pageSize ?? 20).toString()),
    };

    const follows = (
      await this.dataSource
        .getRepository(Follow)
        .createQueryBuilder("follow")

        .leftJoinAndSelect("follow.me", "follow_me")
        .leftJoinAndSelect("follow_me.photo", "follow_me_photo")

        .leftJoinAndSelect("follow.follow", "follow_follow")
        .leftJoinAndSelect("follow_follow.photo", "follow_follow_photo")

        .where(`follow_me.id = '${user.id}'`)
        .getMany()
    ).map((follow) => `'${follow.follow.id}'`);

    follows.push(`'${user.id}'`);

    const queryBuilder = this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.photo", "photo")
      .andWhere(`user.id NOT IN (${follows.join(",")})`)
      .skip((pagination.pageSize - 1) * pagination.page)
      .take(pagination.pageSize);

    if (this.request.query.q) {
      const result = await Meili.index("users").search<User>(
        (this.request.query.q as string) ?? null,
        {
          filter: [`id NOT IN [${follows.join(",")}]`],
          page: pagination.page,
          hitsPerPage: pagination.pageSize,
        },
      );

      if (result.hits.length) {
        queryBuilder.andWhere(
          `user.id IN (${result.hits.map((user) => `'${user.id}'`).join(",")})`,
        );
      }
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    for (let i = 0; i < users.length; i++) {
      delete users[i].password;
    }

    return {
      ...pagination,
      data: users,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  async updateProfile() {
    const params = this.request.body as {
      name: string;
      username: string;
      photo: Attachment;
      bio: string;
      preferencies: any;
    };
    const user = this.request.session.user as User;

    user.name = params.name;
    user.username = params.username;
    user.bio = params.bio;
    user.preferencies = params.preferencies;

    if (params.photo && !params.photo.id) {
      user.photo = this.dataSource
        .getRepository(Attachment)
        .create(params.photo);
      user.photo._allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    } else user.photo = null;

    const u = await this.dataSource
      .getRepository(User)
      .createQueryBuilder("user")
      .andWhere(`username = '${params.username}'`)
      .andWhere(`user.id != '${user.id}'`)
      .getOne();

    if (u) throw new BadRequestException("username_is_already_taken");

    await this.dataSource.manager.save(user);

    delete user.password;
    await Meili.index("users").addDocuments([user]);

    return user;
  }

  async updatePassword() {
    const params = this.request.body as { password: string };

    if (!params.password) throw new BadRequestException("password_required");

    const _user = this.request.session.user as any as User;
    if (_user.password) {
      if (_user.verifyPassword(params.password)) {
        throw new BadRequestException(
          "new_password_must_be_different_that_current_password",
        );
      }
    }

    _user.password = { plain: params.password };
    await _user.save();

    return {};
  }

  async nPosts() {
    const user = await this.get();

    return {
      nPosts: await this.dataSource
        .getRepository(Post)
        .createQueryBuilder("post")
        .leftJoinAndSelect("post.user", "user")
        .andWhere(`user.id = '${user.id}'`)
        .getCount(),
    };
  }
}
