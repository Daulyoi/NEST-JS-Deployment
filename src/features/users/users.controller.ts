import { Body, Controller, HttpStatus, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequireAuth } from '../../auth/decorators/auth.decorator';
import { DataResponse } from '../../infrastructure/core/http/http-response';
import { UpdateUserUseCase } from './use-cases';
import { UpdateUserDto } from './use-cases/update/update.dto';

@ApiTags('Users')
@ApiBearerAuth()
@RequireAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly updateUseCase: UpdateUserUseCase) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update profil user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.updateUseCase.execute(id, dto);
    return new DataResponse(HttpStatus.OK, 'User berhasil diupdate', data);
  }
}
