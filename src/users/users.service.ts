import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Userwx, Userphone } from '../entity/users.entity';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { STATUS } from '../const';
import { WxhttpService } from '../wxhttp/wxhttp.service';

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
  ) {}

  async reg(username: string, password: string, ifwx = false) {
    const hmac = createHmac(
      'sha256',
      this.configService.get<string>('encrypt.hmac'),
    );

    hmac.update(password);
    const hmacPW = hmac.digest('hex');
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

  async wxlogin(code: string) {
    const { openid, unionid } = await this.wxHttpService.getOpenid(code);
    const wxsql = this.userwxRepo.findOne({ where: { openid: openid } });
    if (wxsql === null) {
      // 新用户注册
      const newUser = await this.reg(openid, openid, true);
      const userid = newUser.userid;
      const newWxUser: Userwx = {
        userid: userid,
        openid: openid,
        unionid: unionid,
      };
      await this.userwxRepo.save(newWxUser);
    } else {
    }
  }
}
