import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import configuration from '../config/configuration';
import { User, Userwx, Userphone } from '../entity/users.entity';
import { UsersService } from './users.service';
import { WxhttpService } from '../wxhttp/wxhttp.service';
import { RedisService } from '../redis/redis.service';
import { DateTime } from 'luxon';
import { STATUS } from '../const';
import { Repository } from 'typeorm';

const mockUser = {
  username: 'test0',
  password: 'test0password',
};

const mockUserRepository: User[] = [
  {
    userid: '0F9619FF-8B86-D011-B42D-00C04FC964FF',
    username: 'test0',
    password: 'test0hamcstringlist',
    status: STATUS.INIT,
    regtime: DateTime.now().toJSDate(),
    ifwx: false,
    ifphone: false,
  },
  {
    userid: '1F9619FF-8B86-D011-B42D-004588C964FF',
    username: 'test1',
    password: 'test1hamcstringlist',
    status: STATUS.INIT,
    regtime: DateTime.now().toJSDate(),
    ifwx: true,
    ifphone: false,
  },
  {
    userid: '2HGH19FF-8B86-D011-B42D-00C04FC964FF',
    username: 'test2',
    password: 'test2hamcstringlist',
    status: STATUS.NORMAL,
    regtime: DateTime.now().toJSDate(),
    ifwx: true,
    ifphone: true,
  },
];
const mockUserwxRepository: Userwx[] = [
  {
    userid: '2HGH19FF-8B86-D011-B42D-00C04FC964FF',
    openid: 'test2openid',
    unionid: 'tes2tunionid',
  },
];
const mockUserphoneRepository: Userphone[] = [
  {
    userid: '2HGH19FF-8B86-D011-B42D-00C04FC964FF',
    phone: '11111111111',
  },
];
const testToken = 'asdfgasdfgasdfgas3fga';
const testCode = 'safgfdas897870790';

describe('UsersService', () => {
  let service: UsersService;
  let redisService: RedisService;
  let wxHttpService: WxhttpService;
  let userRepo: Repository<User>;
  let userwxRepo: Repository<Userwx>;
  let userphoneRepo: Repository<Userphone>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [configuration],
        }),
      ],
      providers: [
        UsersService,
        RedisService,
        WxhttpService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository<User>,
        },
        {
          provide: getRepositoryToken(Userwx),
          useClass: Repository<Userwx>,
        },
        {
          provide: getRepositoryToken(Userphone),
          useClass: Repository<Userphone>,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    redisService = module.get<RedisService>(RedisService);
    wxHttpService = module.get<WxhttpService>(WxhttpService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    userwxRepo = module.get<Repository<Userwx>>(getRepositoryToken(Userwx));
    userphoneRepo = module.get<Repository<Userphone>>(
      getRepositoryToken(Userphone),
    );
  });

  it('register user', async () => {
    const username = mockUser.username;
    const password = mockUser.password;
    jest.spyOn(userRepo, 'save').mockImplementation(async () => {
      return mockUserRepository[0];
    });
    expect(service.reg(username, password)).resolves.toBe(
      mockUserRepository[0],
    );
  });
  it('wx register user', async () => {
    jest.spyOn(wxHttpService, 'getOpenid').mockImplementation(async () => {
      return {
        openid: mockUserwxRepository[0].openid,
        unionid: mockUserwxRepository[0].unionid,
      };
    });
    jest.spyOn(userwxRepo, 'findOne').mockImplementation(async () => {
      return null;
    });
    jest.spyOn(userRepo, 'save').mockImplementation(async () => {
      return mockUserRepository[2];
    });
    jest.spyOn(userwxRepo, 'save').mockImplementation(async () => {
      return mockUserwxRepository[0];
    });
    jest.spyOn(redisService, 'setToken').mockImplementation(async () => {
      return testToken;
    });
    const action = service.wxlogin(testCode);
    await expect(action).resolves.toStrictEqual({
      status: 2,
      token: testToken,
    });
    expect(redisService.setToken).toHaveBeenCalledWith(
      mockUserRepository[2].userid,
      mockUserRepository[2].status,
    );
  });
  it('wx login user', async () => {
    jest.spyOn(wxHttpService, 'getOpenid').mockImplementation(async () => {
      return {
        openid: mockUserwxRepository[0].openid,
        unionid: mockUserwxRepository[0].unionid,
      };
    });
    jest.spyOn(userwxRepo, 'findOne').mockImplementation(async () => {
      return mockUserwxRepository[0];
    });
    jest.spyOn(userRepo, 'findOne').mockImplementation(async () => {
      return mockUserRepository[2];
    });
    // 写法2 代替spyOn
    redisService['setToken'] = jest.fn().mockResolvedValue(testToken);
    const action = service.wxlogin(testCode);
    await expect(action).resolves.toStrictEqual({
      status: 1,
      token: testToken,
    });
    expect(redisService.setToken).toHaveBeenCalledWith(
      mockUserRepository[2].userid,
      mockUserRepository[2].status,
    );
    expect(wxHttpService.getOpenid).toHaveBeenCalledWith(testCode);
  });

  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });
});
