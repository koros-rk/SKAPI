import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exeption_response = exception.getResponse();

    const status = exception.getStatus();
    const message = exception.message.toUpperCase();
    const details =
      exeption_response instanceof String
        ? exeption_response
        : (exeption_response as { details: object }).details;

    response.status(status).json({
      status,
      message,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}
