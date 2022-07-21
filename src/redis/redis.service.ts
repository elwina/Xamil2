import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

const TAG = '初始化';

@Injectable()
export class RedisService implements OnModuleInit {
  client: RedisClientType;

  constructor(private configService: ConfigService) {
    this.client = createClient({
      url: configService.get<string>('redis.url'),
      password: configService.get<string>('redis.password'),
    });
    // this.client.on('error', (err) => console.log('Redis Client Error', err));
  }

  async onModuleInit() {
    await this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      await this.client.select(0);
      Logger.log('redis connect成功', TAG);
    } catch {
      Logger.log('redis connect失败', TAG);
    }
  }

  async check() {
    try {
      await this.client.ping();
      return true;
    } catch {
      Logger.error('redis ping错误', 'redis');
      throw new Error('redis ping错误');
    }
  }

  async quit() {
    await this.client.quit();
  }
}
