import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User, Userwx, Userphone } from '../entity/users.entity';
import { RedisModule } from '../redis/redis.module';
import { WxhttpModule } from '../wxhttp/wxhttp.module';
import { SmsModule } from 'src/sms/sms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Userwx, Userphone]),
    WxhttpModule,
    RedisModule,
    SmsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
