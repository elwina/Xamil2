import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User, Userwx, Userphone } from '../entity/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Userwx, Userphone])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
