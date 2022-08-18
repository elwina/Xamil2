export class PostWxloginDto {
  code: string;
}

export class PostWxloginSuccessDto {
  status: 1 | 2;
  token: string;
}

export class PostLoginDto {
  username: string;
  password: string;
}

export class PostLoginSuccessDto {
  status: 1 | 2;
  token?: string;
}

export class PostPhoneDto {
  phone: string;
}

export class PostPhoneSuccessDto {
  status: 1 | 2;
}

export class PostVercodeDto {
  phone: string;
  vercode: number;
}

export class PostVercodeSuccessDto {
  status: 1 | 2;
}
