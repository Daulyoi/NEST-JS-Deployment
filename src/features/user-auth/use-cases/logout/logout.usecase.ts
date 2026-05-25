import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCredentials } from '../../../../domain/entity/user-credentials.entity';

@Injectable()
export class LogoutUseCase {
  constructor(
    @InjectRepository(UserCredentials)
    private readonly credentialsRepository: Repository<UserCredentials>,
  ) {}

  async execute(credentialId: string): Promise<void> {
    await this.credentialsRepository.update(credentialId, {
      activeToken: undefined,
    });
  }
}
