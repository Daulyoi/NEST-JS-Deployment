import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireAuth } from '../../auth/decorators/auth.decorator';
import { DataResponse } from '../../infrastructure/core/http/http-response';
import {
  GetAllUsersUseCase,
  GetOneUserUseCase,
  UpdateUserUseCase,
} from './use-cases';
import { UpdateUserDto } from './use-cases/update/update.dto';

@ApiTags('Users')
@ApiBearerAuth()
@RequireAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly getAllUseCase: GetAllUsersUseCase,
    private readonly getOneUseCase: GetOneUserUseCase,
    private readonly updateUseCase: UpdateUserUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Ambil semua user' })
  async findAll() {
    const data = await this.getAllUseCase.execute();
    return new DataResponse(HttpStatus.OK, 'Users berhasil diambil', data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil user berdasarkan ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.getOneUseCase.execute(id);
    return new DataResponse(HttpStatus.OK, 'User berhasil diambil', data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update profil user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.updateUseCase.execute(id, dto);
    return new DataResponse(HttpStatus.OK, 'User berhasil diupdate', data);
  }
}
