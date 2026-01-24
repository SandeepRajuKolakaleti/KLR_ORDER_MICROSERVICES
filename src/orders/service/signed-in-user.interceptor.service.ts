import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { UserService } from './user.service';
import { LoginApigateDto } from './../models/dto/LoginApigate.dto';

@Injectable()
export class SignedInUserInterceptor implements NestInterceptor {
  constructor(private userService: UserService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

     if (request.user?.email && request.user?.password) {
      const loginData: LoginApigateDto = {
        email: request.user.email,
        password: request.user.password,
      };

      try {
        const signedUser = await firstValueFrom(
          this.userService.loginUser(loginData).pipe(

            retry(1),                   // retry once
            timeout(4000),              // max 4 seconds
            map((res: any) => res),

            catchError(err => {
              console.error('UserService login failed:', err.message);
              return of(null);          // do NOT throw → avoid ECONNRESET crash
            })
          )
        );

        if (signedUser) {
          request.user = signedUser;    // attach safe
        }

      } catch (error: any) {
        console.error('Interceptor error:', error.message);
        // do NOT throw → allow controller to run
      }
    }

    return next.handle();
  }
}
