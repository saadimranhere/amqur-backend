import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    // ✅ optional for super admin
    @IsOptional()
    @IsString()
    locationId?: string;

    @IsNotEmpty()
    @IsString()
    tenantId: string;
}
