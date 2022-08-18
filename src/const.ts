export enum STATUS {
  NORMAL, // 正常
  INIT, // 未绑定手机
  NONE, // 注销
  RISK, // 风险
  ERROR, // 错误
}

export enum ANOTAG {
  ANO,
  PUBLIC,
  CERT,
  OFFICIAL,
  RISK,
}

export enum MSGTYPE {
  TXT,
  IMAGE,
}

export enum ROLE {
  VISITOR,
  NORMAL,
  CERT,
  ADMIN,
}
