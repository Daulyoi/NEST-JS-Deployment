import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../../../auth/auth.service';
import { AuthRoleEnum } from '../../../../auth/enums/auth.enum';
import { IAuthToken } from '../../../../auth/interfaces/auth-token.interface';
import { Customer } from '../../../../domain/entity/customer.entity';
import { UserCredentials } from '../../../../domain/entity/user-credentials.entity';
import { PasswordHasher } from '../../../../libs/password-hasher/password-hasher';
import { RegisterDto } from './register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(UserCredentials)
    private readonly credentialsRepository: Repository<UserCredentials>,
    private readonly authService: AuthService,
  ) {}

  async execute(dto: RegisterDto): Promise<IAuthToken> {
    const emailExists = await this.credentialsRepository.findOne({
      where: { email: dto.email },
    });
    if (emailExists) throw new ConflictException('Email sudah terdaftar');

    const usernameExists = await this.credentialsRepository.findOne({
      where: { username: dto.username },
    });
    if (usernameExists) throw new ConflictException('Username sudah digunakan');

    const customer = this.customerRepository.create({
      fullName: dto.fullName,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      mothersMaidenName: dto.mothersMaidenName,
      demographicSegment: dto.demographicSegment,
      monthlyIncome: dto.monthlyIncome ?? 0,
      savingsGoal: dto.savingsGoal ?? 0,
    });
    const savedCustomer = await this.customerRepository.save(customer);

    const hashedPassword = await PasswordHasher.hash(dto.password);
    const hashedMpin = dto.mpin ? await PasswordHasher.hash(dto.mpin) : undefined;

    const credentials = this.credentialsRepository.create({
      customerId: savedCustomer.id,
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      ...(hashedMpin && { mpin: hashedMpin }),
    });
    const savedCredentials = await this.credentialsRepository.save(credentials);

    const token = this.authService.generateJwtToken({
      id: savedCredentials.id,
      customerId: savedCustomer.id,
      email: savedCredentials.email,
      roles: [AuthRoleEnum.USER],
    });
    await this.credentialsRepository.update(savedCredentials.id, {
      activeToken: token,
    });

    return { token };
  }
}
