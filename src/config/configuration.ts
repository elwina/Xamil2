import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const FILENAME = 'conf.yaml';
const FILES = [
  join(__dirname, FILENAME),
  join(__dirname, '../', FILENAME),
  join(__dirname, '../../', FILENAME),
  join(__dirname, '../config', FILENAME),
  join(__dirname, '../../config', FILENAME),
];

export default () => {
  for (const file of FILES) {
    try {
      fs.accessSync(file, fs.constants.R_OK);
      Logger.log(`配置文件找到,文件路径${file}`, `初始化`);
      return yaml.load(fs.readFileSync(file, 'utf8')) as Record<string, any>;
    } catch {
      continue;
    }
  }
  Logger.error(`找不到配置文件`, `初始化`);
};
