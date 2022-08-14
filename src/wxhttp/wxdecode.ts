import { createDecipheriv } from 'crypto';

interface WxData {
  openId: string;
  unionId: string;
  watermark: {
    timestamp: number;
    appid: string;
  };
}

export function wxDecode(
  strSessionKey: string,
  strEncryptedData: string,
  strIv: string,
): WxData {
  const sessionKey = Buffer.from(strSessionKey, 'base64');
  const encryptedData = Buffer.from(strEncryptedData, 'base64');
  const iv = Buffer.from(strIv, 'base64');
  let decoded: string;
  let re: WxData;
  try {
    const decipher = createDecipheriv('aes-128-cbc', sessionKey, iv);
    decipher.setAutoPadding(true);
    decoded = decipher.update(encryptedData, undefined, 'utf8');
    decoded += decipher.final('utf8');
    re = JSON.parse(decoded);
  } catch {
    throw new Error('用户信息解码错误');
  }
  return re;
}
