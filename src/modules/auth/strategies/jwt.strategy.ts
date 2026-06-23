// src/modules/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../../users/users.service';
import { UserStatus } from 'src/common/enum/user-status';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'dev_secret',
    });
  }

  /**
   * 🎯 دالة التحقق بعد فك تشفير التوكن الناجح
   */
  async validate(payload: any) {
    // payload.sub = userId
    const user = await this.usersService.findById(payload.sub);

    // UsersService ترجع user حي (غير محذوف). هنا نثبت status.
    if (!user || user.isDeleted) {
      throw new UnauthorizedException('هذا الحساب لم يعد موجوداً في النظام');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('هذا الحساب غير نشط حالياً، يرجى مراجعة الإدارة');
    }

    // حقن البيانات الصافية داخل req.user
    return {
      userId: payload.sub,
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions ?? [],
    };
  }
}

