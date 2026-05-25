import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { AUTH_REQUEST_USER_KEY } from '../enums/auth.enum';
import { ICurrentUser } from '../interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
  (field: keyof ICurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request[AUTH_REQUEST_USER_KEY] as ICurrentUser;
    return field ? user?.[field] : user;
  },
);
