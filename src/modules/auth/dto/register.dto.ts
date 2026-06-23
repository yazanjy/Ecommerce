import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleType } from 'src/common/enum/role-type.enum';

export class RegisterDto {
  @ApiProperty({ description: 'اسم المستخدم', example: 'Ahmad AlSamadi' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'البريد الإلكتروني', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'كلمة المرور', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'دور المستخدم', enum: RoleType })
  @IsEnum(RoleType)
  role: RoleType;

  @ApiPropertyOptional({ description: 'رقم الهاتف (اختياري)', example: '+9627xxxxxxx' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'صورة الملف الشخصي (اختياري)' })
  @IsOptional()
  @IsString()
  profileImage?: string;
}

