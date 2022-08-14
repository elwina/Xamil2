import { STATUS } from '../const';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') userid: string;
  @Column() username: string;
  @Column() password: string;
  @Column({ type: 'enum', enum: STATUS }) status: STATUS;
  @Column({ type: 'datetime' }) regtime: Date;
  @Column({ default: false }) ifwx: boolean;
  @Column({ default: false }) ifphone: boolean;
}

@Entity()
export class Userwx {
  @PrimaryColumn() userid: string;
  @Column() openid: string;
  @Column() unionid: string;
}

@Entity()
export class Userphone {
  @PrimaryColumn() userid: string;
  @Column() phone: string;
}
