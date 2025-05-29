export interface IFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  url?: string;
}

export interface IHastag {
  id: string;
  name: string;
  n: number;
  dates: { [key: string]: number };
}
