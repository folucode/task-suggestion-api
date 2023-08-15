export enum Status {
  Success = 'success',
  Failure = 'failure',
}

export interface Response<T> {
  message: string;
  status: Status;
  data: T | [] | null;
}
