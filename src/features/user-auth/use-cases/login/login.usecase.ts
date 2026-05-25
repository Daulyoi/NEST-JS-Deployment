import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../../../auth/auth.service';
import { AuthRoleEnum } from '../../../../auth/enums/auth.enum';
import { IAuthToken } from '../../../../auth/interfaces/auth-token.interface';
import { UserCredentials } from '../../../../domain/entity/user-credentials.entity';
import { PasswordHasher } from '../../../../libs/password-hasher/password-hasher';
import { LoginDto } from './login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @InjectRepository(UserCredentials)
    private readonly credentialsRepository: Repository<UserCredentials>,
    private readonly authService: AuthService,
  ) {}

  async execute(dto: LoginDto): Promise<IAuthToken> {
    const credentials = await this.credentialsRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password', 'customerId'],
    });

    if (!credentials?.password)
      throw new UnauthorizedException('Email atau password salah');

    const isValid = await PasswordHasher.verify(dto.password, credentials.password);
    if (!isValid) throw new UnauthorizedException('Email atau password salah');

    const token = this.authService.generateJwtToken({
      id: credentials.id,
      customerId: credentials.customerId,
      email: credentials.email,
      roles: [AuthRoleEnum.USER],
    });
    await this.credentialsRepository.update(credentials.id, {
      activeToken: token,
    });

    return { token };
  }
}
