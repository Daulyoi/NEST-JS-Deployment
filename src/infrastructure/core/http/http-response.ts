export abstract class HTTPResponse {
  success: boolean = true;
  statusCode: number;
  message: string;
}

export class MessageResponse extends HTTPResponse {
  constructor(statusCode: number, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

export class DataResponse<T> extends MessageResponse {
  readonly data: T;

  constructor(statusCode: number, message: string, data: T) {
    super(statusCode, message);
    this.data = data;
  }
}
