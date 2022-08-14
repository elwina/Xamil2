import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { WxhttpModule } from '../wxhttp/wxhttp.module';
import configuration from '../config/configuration';
import { User, Userwx, Userphone } from '../entity/users.entity';
import { UsersService } from './users.service';

const mockUserRepository = {};
const mockUser = {
  username: 'testname',
  password: 'www123',
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn().mockResolvedValue(mockUserRepository),
            findOneBy: jest.fn().mockResolvedValue(mockUserRepository),
            save: jest.fn().mockResolvedValue(mockUser),
            remove: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Userwx),
          useValue: {
            find: jest.fn().mockResolvedValue(mockUserRepository),
            findOneBy: jest.fn().mockResolvedValue(mockUserRepository),
            save: jest.fn().mockResolvedValue(mockUser),
            remove: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Userphone),
          useValue: {
            find: jest.fn().mockResolvedValue(mockUserRepository),
            findOneBy: jest.fn().mockResolvedValue(mockUserRepository),
            save: jest.fn().mockResolvedValue(mockUser),
            remove: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('register user', async () => {
    const username = mockUser.username;
    const password = mockUser.password;
    expect(await service.reg(username, password)).toBe(mockUser);
  });
});
