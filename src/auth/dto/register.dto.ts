import {
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
    ValidateIf,
} from 'class-validator';

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

    // ✅ THIS IS THE KEY FIX
    @ValidateIf((o) => o.locationId !== undefined)
    @IsString()
    locationId?: string;
}
