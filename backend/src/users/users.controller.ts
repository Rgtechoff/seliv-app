import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    const { passwordHash: _pw, ...safeUser } = user;
    return { data: safeUser };
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    const updated = await this.usersService.update(user.id, dto);
    const { passwordHash: _pw, ...safeUser } = updated;
    return { data: safeUser };
  }

  @Get(':id/public')
  async getPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user) return { data: null };
    return {
      data: {
        id: user.id,
        firstName: user.firstName,
        lastInitial: user.lastName?.charAt(0) ?? '',
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        zones: user.zones,
        categories: user.categories,
        level: user.level,
        isStar: user.isStar,
      },
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    return { data: users.map(({ passwordHash: _pw, ...u }) => u) };
  }

  @Patch(':id/validate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async validateVendeur(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.validateVendeur(id);
    const { passwordHash: _pw, ...safeUser } = user;
    return { data: safeUser };
  }

  @Patch(':id/toggle-star')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleStar(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.toggleStar(id);
    const { passwordHash: _pw, ...safeUser } = user;
    return { data: safeUser };
  }
}
