import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Userwx, Userphone } from '../entity/users.entity';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { STATUS } from '../const';
import { WxhttpService } from '../wxhttp/wxhttp.service';
import {
  PostLoginSuccessDto,
  PostVercodeSuccessDto,
  PostWxloginSuccessDto,
} from '../dto/users.dto';
import { RedisService } from '../redis/redis.service';
import { SmsService } from 'src/sms/sms.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Userwx)
    private userwxRepo: Repository<Userwx>,
    @InjectRepository(Userphone)
    private userphoneRepo: Repository<Userphone>,
    private configService: ConfigService,
    private wxHttpService: WxhttpService,
    private redisService: RedisService,
    private smsService: SmsService,
  ) {}

  hmacPassword(password: string): string {
    const hmac = createHmac(
      'sha256',
      this.configService.get<string>('encrypt.hmac'),
    );
    hmac.update(password);
    return hmac.digest('hex');
  }

  async reg(username: string, password: string, ifwx = false) {
    const hmacPW = this.hmacPassword(password);
    const user = new User();
    user.username = username;
    user.password = hmacPW;
    user.regtime = DateTime.now().toJSDate();
    user.status = STATUS.INIT;
    if (ifwx) {
      user.ifwx = true;
    } else {
      user.ifwx = false;
    }
    user.ifphone = false;

    return await this.userRepo.save(user);
  }

  async login(
    username: string,
    password: string,
  ): Promise<PostLoginSuccessDto> {
    const usersql = await this.userRepo.findOne({
      where: { username: username },
    });
    if (usersql === null) {
      return { status: 2 };
    } else if (usersql.password !== this.hmacPassword(password)) {
      return { status: 2 };
    } else {
      const token = await this.redisService.setToken(
        usersql.userid,
        usersql.status,
      );
      return { status: 1, token: token };
    }
  }

  async wxlogin(code: string): Promise<PostWxloginSuccessDto> {
    const { openid, unionid } = await this.wxHttpService.getOpenid(code);
    const wxsql = await this.userwxRepo.findOne({ where: { openid: openid } });
    if (wxsql === null) {
      // ???????????????
      const newUser = await this.reg(openid, openid, true);
      const userid = newUser.userid;
      const newWxUser: Userwx = {
        userid: userid,
        openid: openid,
        unionid: unionid,
      };
      await this.userwxRepo.save(newWxUser);
      const token = await this.redisService.setToken(userid, newUser.status);
      return { status: 2, token: token };
    } else {
      // ????????????
      const userid = wxsql.userid;
      const user = await this.userRepo.findOne({ where: { userid: userid } });
      const token = await this.redisService.setToken(userid, user.status);
      return { status: 1, token: token };
    }
  }

  // ???????????????
  async sendPhone(userid: string, phone: string) {
    // ???????????????
    const existphone = await this.userphoneRepo.findOne({
      where: { phone: phone },
    });
    if (existphone !== null) {
      // ????????????????????????
      return { status: 2 };
    } else {
      // ???????????????
      const vercode = Math.floor(Math.random() * 9000) + 1000;
      await this.smsService.sendCode(vercode.toString(), phone);
      await this.redisService.setVercode(phone, vercode);
      return { status: 1 };
    }
  }

  // ???????????????????????????
  async verPhone(
    userid: string,
    phone: string,
    code: number,
  ): Promise<PostVercodeSuccessDto> {
    if (await this.redisService.checkVercode(phone, code)) {
      await this.tiePhone(userid, phone);
      return { status: 1 };
    } else {
      // ???????????????
      return { status: 2 };
    }
  }

  async tiePhone(userid: string, phone: string) {
    // ???????????????
    const existphone = await this.userphoneRepo.findOne({
      where: { phone: phone },
    });
    if (existphone !== null) {
      // ????????????????????????
      // ????????????
    } else {
      const userphone: Userphone = {
        userid: userid,
        phone: phone,
      };
      await this.userphoneRepo.save(userphone);
      const user: User = await this.userRepo.findOne({
        where: { userid: userid },
      });
      user.ifphone = true;
      user.status = STATUS.NORMAL;
      await this.userRepo.save(user);
      return { status: 1 };
    }
  }
}
