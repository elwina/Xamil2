import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { STATUS } from '../const';
import { customAlphabet } from 'nanoid';
import { DateTime } from 'luxon';

const TAG = '初始化';
const LOGIN_EXPIRE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 21);

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
      Logger.error('redis connect失败', TAG);
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
    const token: string = nanoid();
    const ifExist = await this.client.exists(token);
    if (ifExist === 1) {
      return await this.setToken(userid, status);
    } else {
      await this.client.hSet(token, 'userid', userid);
      await this.client.hSet(token, 'status', status);
      await this.client.hSet(token, 'time', DateTime.local().toString());
      await this.client.expire(token, LOGIN_EXPIRE_SECONDS);
      return token;
    }
  }

  async checkToken(token: string): Promise<string | false> {
    const ifExist = await this.client.exists(token);
    if (ifExist === 1) {
      const userid = await this.client.hGet(token, 'userid');
      return userid;
    } else {
      return false;
    }
  }

  async getStatus(token: string): Promise<STATUS> {
    const status = await this.client.hGet(token, 'status');
    return Number(status);
  }

  async deleteToken(token: string) {
    await this.client.del(token);
    return true;
  }

  async setVercode(phone: string, code: number) {
    await this.client.set(phone, code);
    return true;
  }

  async checkVercode(phone: string, code: number) {
    const targetCode = parseInt(await this.client.get(phone));
    await this.client.del(phone);
    if (targetCode && targetCode === code) {
      return true;
    } else {
      return false;
    }
  }
}

// interface RedisUserData {
//   userid: string;
//   status: STATUS;
//   time: string;
// }
