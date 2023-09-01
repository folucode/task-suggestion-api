export enum Status {
  Success = 'success',
  Failure = 'failure',
}

interface DataFormat {
  message: string;
  status: Status;
  data: any;
}

export interface Response {
  statusCode: number;
  data: DataFormat;
}
