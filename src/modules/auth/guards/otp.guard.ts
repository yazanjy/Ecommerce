import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class OtpGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      throw new UnauthorizedException('يجب تزويد رمز التحقق المخصص (OTP Token)');
    }

    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'OTP_VERIFIED') {
        throw new UnauthorizedException('رمز التحقق غير صالح لإتمام هذه العملية');
      }
 
      req.email = payload.email; // حقن الإيميل الموثق في الطلب
      return true;
    } catch (error) {
      throw new UnauthorizedException('انتهت صلاحية رمز التحقق أو أن الرمز غير صحيح');
    }
  }
}