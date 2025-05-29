import type { IFile } from ".";

export interface IUser {
  id: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  name: string;
  photo?: IFile;

  preferencies: { lang: string; mode: "light" | "dark" | null };
}

export interface IFollow {
  id: string;
  createdAt: string;
  updatedAt: string;
  me: IUser;
  follow: IUser;
}
