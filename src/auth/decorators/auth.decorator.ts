import { SetMetadata } from '@nestjs/common';
import { AuthDecoratorEnum } from '../enums/auth.enum';

export const RequireAuth = (
  ...roles: string[]
): ReturnType<typeof SetMetadata> =>
  SetMetadata(AuthDecoratorEnum.ROLES_KEY, roles.length ? roles : ['ANY']);
