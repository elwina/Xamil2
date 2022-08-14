import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

const TAG = 'wxhttp';

@Injectable()
export class WxhttpService {
  private readonly logger = new Logger(TAG);

  private instance = axios.create({
    baseURL: 'https://api.weixin.qq.com/',
  });

  private accessToken: string;

  public APPID = this.configService.get<string>('wx.appid');
  public SECRECT = this.configService.get<string>('wx.secret');

  private addToken: number;

  constructor(private configService: ConfigService) {
    this.wxtoken();
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async wxtoken() {
    const res = await this.instance.get(
      `cgi-bin/token?grant_type=client_credential&appid=${this.APPID}&secret=${this.SECRECT}`,
    );
    const token = res.data.access_token;
    this.accessToken = token;
    this.logger.log('获得新token' + this.accessToken);
    if (this.addToken) {
      this.instance.interceptors.request.eject(this.addToken);
    }
    this.addToken = this.instance.interceptors.request.use(function (config) {
      config.params = {
        access_token: token,
        ...config.params,
      };
      return config;
    });
  }

  async getOpenid(code: string) {
    const res = await this.instance.get('sns/jscode2session', {
      params: {
        appid: this.APPID,
        secret: this.SECRECT,
        js_code: code,
        grant_type: 'authorization_code',
      },
    });
    const openid: string = res.data.openid;
    const unionid: string = res.data.unionid;
    return { openid, unionid };
  }

  axios() {
    return this.instance;
  }
}
