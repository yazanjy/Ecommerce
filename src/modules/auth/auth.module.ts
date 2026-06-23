import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/modules/users/users.module';
// تم حذف استيراد الـ UsersService من هنا لأنه لم يعد مستخدماً في هذا الملف مباشرة

import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    UsersModule, // 👈 ممتاز، هذا السطر كافٍ لجلب الـ UsersService بكل إعداداتها
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET') || 'dev_secret',
          signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRES_IN') as any) || 900,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  // 👇 قمنا بحذف UsersService من هنا تماماً
  providers: [AuthService, JwtStrategy, RefreshStrategy], 
  exports: [AuthService],
})
export class AuthModule {}