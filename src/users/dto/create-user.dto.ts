import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @MaxLength(200)
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(200)
    password: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    lastName: string;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    role?: string;

    @IsString()
    @IsNotEmpty()
    tenantId: string;

    @IsString()
    @IsNotEmpty()
    locationId: string;
}
