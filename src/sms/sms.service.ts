import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sms } from 'tencentcloud-sdk-nodejs';
import { Client } from 'tencentcloud-sdk-nodejs/tencentcloud/services/sms/v20210111/sms_client';

const SmsClient = sms.v20210111.Client;
const TAG = '短信';

@Injectable()
export class SmsService {
  client: Client;
  constructor(private configService: ConfigService) {
    this.client = new SmsClient({
      credential: {
        secretId: this.configService.get<string>('tencent.secretid'),
        secretKey: this.configService.get<string>('tencent.secretkey'),
      },
      region: 'ap-nanjing',
      profile: {
        signMethod: 'HmacSHA256',
        httpProfile: {
          reqMethod: 'POST',
          reqTimeout: 30,
          endpoint: 'sms.tencentcloudapi.com',
        },
      },
    });
  }

  async sendCode(code: string, phone: string) {
    const params = {
      SmsSdkAppId: this.configService.get<string>('tencent.smsid'),
      SignName: this.configService.get<string>('tencent.signname'),
      TemplateId: this.configService.get<string>('tencent.template1'),
      TemplateParamSet: [code],
      PhoneNumberSet: [phone],
    };
    try {
      const res = await this.client.SendSms(params);
      if (res.SendStatusSet[0].Code !== 'Ok') {
        throw new Error(res.SendStatusSet[0].Message);
      }
      return res.RequestId;
    } catch (e) {
      Logger.error(`验证短信发送失败,原因${e}`, TAG);
      throw new Error('验证短信发送失败');
    }
  }
}
