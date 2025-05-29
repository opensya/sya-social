import type { IPost } from "./Post";

export interface IFile {
  name: string;
  type: string;
  size: number;
  content: string;
  url?: string;
}

export interface IResult<T = any> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}
