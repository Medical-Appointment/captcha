import {
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Request,Response as Res } from 'express';
interface Response<T> {
  data: T;
}
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    ctx: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    const req: Request = ctx.switchToHttp().getRequest();
    const rsp: Res = ctx.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        return {
          data,
          code: 0,
          message: '',
        };
      }),
    );
  }
}
