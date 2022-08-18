import { SetMetadata } from '@nestjs/common';
import { ROLE } from '../const';

export const Role = (role: ROLE) => SetMetadata('role', role);
