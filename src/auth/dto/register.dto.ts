import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @MinLength(8)
    password: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    tenantId: string;

    // ✅ OPTIONAL = NO TYPE VALIDATOR
    @IsOptional()
    locationId?: string;
}
