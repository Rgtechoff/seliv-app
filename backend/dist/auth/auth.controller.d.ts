import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        data: {
            access_token: string;
            user: Partial<import("../users/entities/user.entity").User>;
        };
    }>;
    login(dto: LoginDto): Promise<{
        data: {
            access_token: string;
            user: Partial<import("../users/entities/user.entity").User>;
        };
    }>;
}
