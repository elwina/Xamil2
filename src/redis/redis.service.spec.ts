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
    expect(service.check()).resolves.toBe(true);
    await service.quit();
  });

  it('test token', async () => {
    await service.connect();
    const token = await service.setToken('testuser', STATUS.NORMAL);
    expect(service.checkToken(token)).resolves.toBe(true);
    expect(service.getStatus(token)).resolves.toBe(STATUS.NORMAL);
    expect(service.deleteToken(token)).resolves.toBe(true);
    await service.quit();
  });
});
