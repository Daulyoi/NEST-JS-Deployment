import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireAuth } from '../../auth/decorators/auth.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import type { ICurrentUser } from '../../auth/interfaces/current-user.interface';
import {
  DataResponse,
  MessageResponse,
} from '../../infrastructure/core/http/http-response';
import { LoginDto } from './use-cases/login/login.dto';
import { RegisterDto } from './use-cases/register/register.dto';
import {
  GetProfileUseCase,
  LoginUseCase,
  LogoutUseCase,
  RegisterUseCase,
} from './use-cases';

@ApiTags('Auth')
@Controller('auth')
export class UserAuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register akun baru' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUseCase.execute(dto);
    return new DataResponse(HttpStatus.CREATED, 'Registrasi berhasil', result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login dan dapatkan JWT token' })
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto);
    return new DataResponse(HttpStatus.OK, 'Login berhasil', result);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @RequireAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ambil profil customer yang sedang login' })
  async getProfile(@CurrentUser() user: ICurrentUser) {
    const result = await this.getProfileUseCase.execute(user.customerId);
    return new DataResponse(HttpStatus.OK, 'Profil berhasil diambil', result);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @RequireAuth()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout dan invalidasi token' })
  async logout(@CurrentUser() user: ICurrentUser) {
    await this.logoutUseCase.execute(user.id);
    return new MessageResponse(HttpStatus.OK, 'Logout berhasil');
  }
}
