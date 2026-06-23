import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'البريد الإلكتروني', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'كلمة المرور', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}

