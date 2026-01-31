import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<any>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: any;
    }>;
}
