import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class LoginApigateDto {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    password!: string;

    @IsOptional()
    @IsNumber()
    id?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    permissionId?: number;

    @IsOptional()
    @IsString()
    @Type(() => String)
    gwtToken?: string;

    @IsOptional()
    @IsString()
    permissionName?: string;

    @IsOptional()
    @IsString()
    @Type(() => String)
    phonenumber?: string;

    @IsOptional()
    @IsString()
    tokenStr?: string;

    @IsOptional()
    @IsString()
    name?: string;

}