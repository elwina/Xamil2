import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ROLE } from '../const';
import { Role } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { PostWxloginDto, PostPhoneDto, PostVercodeDto } from '../dto/users.dto';
import { Userid } from '../auth/userid.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('wxlogin')
  @Role(ROLE.VISITOR)
  postWxlogin(@Body() postWxloginDto: PostWxloginDto) {
    return this.usersService.wxlogin(postWxloginDto.code);
  }

  @Post('phone')
  @Role(ROLE.NORMAL)
  postPhone(@Body() postPhoneDto: PostPhoneDto, @Userid() userid: string) {
    return this.usersService.sendPhone(userid, postPhoneDto.phone);
  }

  @Post('vercode')
  @Role(ROLE.NORMAL)
  postVercode(
    @Body() postVercodeDto: PostVercodeDto,
    @Userid() userid: string,
  ) {
    return this.usersService.verPhone(
      userid,
      postVercodeDto.phone,
      postVercodeDto.vercode,
    );
  }
}
