import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { isArray } from 'class-validator';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let message: string = 'Internal server error';
    let errors: unknown[] | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (
        typeof body === 'object' &&
        body !== null &&
        'message' in body
      ) {
        const bodyMessage = (body as Record<string, unknown>).message;
        if (typeof bodyMessage === 'string') {
          message = bodyMessage;
        } else if (
          isArray(bodyMessage) &&
          (bodyMessage as unknown[]).length > 0
        ) {
          message = (bodyMessage as string[])[0];
          errors = bodyMessage as unknown[];
        }
      }

      if (status >= 500) {
        this.logger.error(exception.message, exception.stack);
      }
    } else {
      status = 500;
      if (exception instanceof Error) {
        message = exception.message;
        this.logger.error(exception.message, exception.stack);
      } else {
        this.logger.error('Unknown error', JSON.stringify(exception));
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: message,
      errors: errors ?? null,
    });
  }
}
