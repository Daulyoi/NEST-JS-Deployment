import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { UserCredentials } from '../../domain/entity/user-credentials.entity';
import { AuthService } from '../auth.service';
import {
  AUTH_REQUEST_USER_KEY,
  AuthDecoratorEnum,
  AuthRoleEnum,
} from '../enums/auth.enum';
import { ICurrentUser } from '../interfaces/current-user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
    @InjectRepository(UserCredentials)
    private readonly credentialsRepository: Repository<UserCredentials>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      AuthDecoratorEnum.ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader)
      throw new UnauthorizedException('Missing authorization header');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Missing token');

    const tokenExistsInDb = await this.credentialsRepository
      .createQueryBuilder('cred')
      .where('cred.activeToken = :token', { token })
      .getCount()
      .then((count) => count > 0);

    if (!tokenExistsInDb)
      throw new UnauthorizedException('Token not recognized');

    const user: ICurrentUser | null = this.authService.verifyJwtToken(token);
    if (!user) throw new UnauthorizedException('Invalid token');

    (request as Request & Record<string, unknown>)[AUTH_REQUEST_USER_KEY] =
      user;

    if (requiredRoles?.length && !requiredRoles.includes(AuthRoleEnum.ANY)) {
      const hasRole = requiredRoles.some((role) =>
        user.roles.includes(role as AuthRoleEnum),
      );
      if (!hasRole) throw new UnauthorizedException('Insufficient role');
    }

    return true;
  }
}
