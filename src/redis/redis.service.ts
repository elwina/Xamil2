import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { STATUS } from '../const';
import { customAlphabet } from 'nanoid';
import { DateTime } from 'luxon';

const TAG = '初始化';
const LOGIN_EXPIRE_SECONDS = 60 * 60 * 24;

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

  async setToken(userid: string, status: STATUS): Promise<string> {
    const token: string = customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyz',
      10,
    )(10);
    // const ifExist = await this.client.exists(token);
    // if (ifExist === 1) {
    //   return this.setToken(userid, status);
    // } else {
    this.client.hSet(token, 'userid', userid);
    this.client.hSet(token, 'status', status);
    this.client.hSet(token, 'time', DateTime.local().toString());
    this.client.expire(token, LOGIN_EXPIRE_SECONDS);
    return token;
    // }
  }
}

interface RedisUserData {
  userid: string;
  status: STATUS;
  time: string;
}
