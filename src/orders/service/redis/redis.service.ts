import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
// import NodeCache from 'node-cache';
const NodeCache = require( "node-cache" );
@Injectable()
export class RedisCacheService {

  myCache = new NodeCache();
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async get(key: string):Promise<any> {
    return await this.myCache.get(key);
    // return await this.cacheManager.get(key);
  }
  public async set(key: string, value: object) {
    await this.myCache.set(key, value);
    // await this.cacheManager.set(key, value);
  }
  public async del(key: any) {
    await this.myCache.del(key);
    // await this.cacheManager.del(key);
  }
  async reset() {
    await this.myCache.flushAll();
    // await this.cacheManager.reset();
  }

}
