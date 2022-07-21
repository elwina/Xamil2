import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { strictEqual, ok } from 'assert';
import { RedisService } from './redis/redis.service';
import { DataSource } from 'typeorm';

const TAG1 = '自检';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    Logger.log(`开始自检`, TAG1);
    this.checkConfig();
    await this.checkRedis();
    this.checkDB();
  }

  checkConfig(): boolean {
    const name = this.configService.get<string>('name');
    try {
      strictEqual('xamil', 'xamil');
      Logger.log(`配置自检成功`, TAG1);
      return true;
    } catch {
      Logger.warn(`配置检查错误,名称字段${name}`, TAG1);
      return false;
    }
  }

  async checkRedis(): Promise<boolean> {
    try {
      await this.redisService.check();
      Logger.log(`redis自检正常`, TAG1);
      return true;
    } catch {
      Logger.warn(`redis自检异常`, TAG1);
      return false;
    }
  }

  checkDB(): boolean {
    try {
      ok(this.dataSource.isInitialized);
      Logger.log(`db自检正常`, TAG1);
      return true;
    } catch {
      Logger.warn(`db`, TAG1);
      return false;
    }
  }
}
