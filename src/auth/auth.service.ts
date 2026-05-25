import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { ICurrentUser } from './interfaces/current-user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJwtToken(payload: ICurrentUser): string {
    const uniqueKey = randomUUID();
    return this.jwtService.sign({ ...payload, uniqueKey });
  }

  verifyJwtToken(token: string): ICurrentUser | null {
    try {
      return this.jwtService.verify<ICurrentUser>(token);
    } catch {
      return null;
    }
  }
}
