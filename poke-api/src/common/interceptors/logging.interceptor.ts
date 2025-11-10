import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;
    
    const now = Date.now();
    
    this.logger.log(
      `📥 ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        const responseTime = Date.now() - now;
        
        this.logger.log(
          `📤 ${method} ${url} - ${statusCode} - ${responseTime}ms`,
        );
        
        // Log performance warning para requests lentos
        if (responseTime > 1000) {
          this.logger.warn(
            `⚠️ Slow request detected: ${method} ${url} took ${responseTime}ms`,
          );
        }
      }),
    );
  }
}