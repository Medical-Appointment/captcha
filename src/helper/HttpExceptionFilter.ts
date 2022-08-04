import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Request, Response } from 'express';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(e: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = e instanceof HttpException ? e.getStatus() : 500;
    console.log(e.stack);
    response.status(status).json({
      code: status,
      msg: e.message,
      timestamp: dayjs().format(' YYYY-MM-DD HH:mm:ss'),
      path: request.url,
    });
  }
}
