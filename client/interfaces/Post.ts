import type { String } from "lodash";
import type { IFile } from ".";
import type { IUser } from "./User";

export interface IPost {
  id: string;
  shareID?: string;
  user: IUser;

  text: string;
  audio: IFile;
  files: IFile[];
  createdAt: string;
  updatedAt: string;

  response?: IPost;
  nResponse: number;
  nRepost: number;
}

export interface IHastag {
  id: string;
  name: string;
  n: number;
  dates: { [key: string]: number };
}
