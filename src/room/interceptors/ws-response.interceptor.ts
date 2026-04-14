import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class WsResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({ success: true, ...data })),
      catchError((error) => {
        const errorMessage =
          error instanceof WsException ? error.getError() : error.message;

        const message =
          typeof errorMessage === 'string'
            ? errorMessage
            : errorMessage instanceof Error
              ? errorMessage.message
              : 'Internal server error';

        return of({ success: false, error: message });
      }),
    );
  }
}
