import {
  Inject,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { CacheModule, CACHE_MANAGER, CacheModuleOptions } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisCacheService } from './redis.service';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async (): Promise<CacheModuleOptions> => {
        return {
          store: await redisStore({
            host: process.env.REDIS_HOST,
            port: 6379,
            ttl: 10,
            connectTimeout: 5000,
          }),
        };
      }
    }),
  ],
  providers:[RedisCacheService],
  exports: [
    RedisCacheModule,
    RedisCacheService,
  ],
})
export class RedisCacheModule implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) {}
  public onModuleInit(): any {
    const logger = new Logger('Cache');
  }
}
