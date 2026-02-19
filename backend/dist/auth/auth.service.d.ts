import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: Partial<User>;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: Partial<User>;
    }>;
    private generateToken;
    private sanitizeUser;
}
