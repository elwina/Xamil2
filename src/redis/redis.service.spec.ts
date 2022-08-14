import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { STATUS } from '../const';
import configuration from '../config/configuration';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('ping', async () => {
    await service.connect();
    expect(await service.check()).toBe(true);
    await service.quit();
  });

  it('set value', async () => {
    await service.connect();
    expect(await checkRedis()).toBe(true);
    await service.quit();
  });

  async function checkRedis(): Promise<boolean> {
    try {
      const redis = service.client;
      const key = 'test';
      const value = 'check';
      await redis.set(key, value);
      const qu = await redis.get(key);
      if (qu === value) {
        await redis.del(key);
        return true;
      }
    } catch {
      return false;
    }
  }

  it('set token', async () => {
    await service.connect();
    const token = await service.setToken('testuser', STATUS.NORMAL);
    expect(await service.client.exists(token)).toBe(1);
    await service.quit();
  });
});
