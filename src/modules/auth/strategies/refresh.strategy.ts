// src/modules/auth/strategies/refresh.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      // ⚡ دعم مزدوج: يقرأ التوكن من الهيدر (للموبايل) أو من الكوكيز (للويندوز والويب) بأمان
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.cookies?.refreshToken,
      ]),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') || 'dev_refresh_secret',
    });
  }

  /**
   * 🎯 دالة التحقق الخاصة بالـ Refresh Token
   */
  async validate(payload: any) {
    // نكتفي بإرجاع الـ userId لكي تستخدمه السيرفيس للتحقق وتوليد توكن جديد
    return {
      userId: payload.sub,
      sub: payload.sub,
    };
  }
}