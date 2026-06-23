import { Body, Controller, Post, Res, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'تسجيل مستخدم جديد' })
  @ApiResponse({ status: 201, description: 'User created' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تسجيل الدخول وإصدار JWT + Refresh cookie' })
  @ApiResponse({ status: 200, description: 'Tokens returned' })
  async login(@Body() dto: LoginDto, @Res() res: Response): Promise<Response> {
    const result = await this.authService.login(dto);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
      path: '/',
    });

    return res.json({
      accessToken: result.accessToken,
      userId: result.userId,
      email: result.email,
      role: result.role,
    });
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token') // 👈 🌟 أضفنا هذا لتظهر علامة القفل في السواجر
  @ApiOperation({ summary: 'تحديث Access token باستخدام Refresh cookie' })
  async refresh(@Req() req: RequestWithUser, @Res() res: Response): Promise<Response> { 
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'جلسة غير صالحة' });
    }

    const data = await this.authService.refresh(userId);
    return res.json(data);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تسجيل الخروج ومسح كوكيز الجلسة' })
  async logout(@Res() res: Response): Promise<Response> {
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', path: '/' });
    return res.json({ ok: true });
  }
}