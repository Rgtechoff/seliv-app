import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return { data: await this.authService.register(dto) };
  }

  @Throttle({ auth: { ttl: 60000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return { data: await this.authService.login(dto) };
  }
}
