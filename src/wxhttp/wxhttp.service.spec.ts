import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import configuration from '../config/configuration';
import { WxhttpService } from './wxhttp.service';

describe('WxhttpService', () => {
  let service: WxhttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [WxhttpService],
    }).compile();

    service = module.get<WxhttpService>(WxhttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
