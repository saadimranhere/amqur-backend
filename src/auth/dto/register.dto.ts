import {
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
    IsUUID,
} from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(2)
    firstName: string;

    @IsString()
    @MinLength(2)
    lastName: string;

    @IsUUID()
    tenantId: string;

    @IsOptional()
    @IsUUID()
    locationId?: string;
}
