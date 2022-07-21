import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import configuration from '../config/configuration';
import { SmsService } from './sms.service';

describe('SmsService', () => {
  let service: SmsService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [SmsService],
    }).compile();

    service = module.get<SmsService>(SmsService);
    config = module.get<ConfigService>(ConfigService);
  });
  it('sms send', () => {
    if (config.get<boolean>('test.smstest')) {
      expect(
        service.sendCode('8888', config.get<string>('test.phone')),
      ).toBeDefined();
    }
  });
});
