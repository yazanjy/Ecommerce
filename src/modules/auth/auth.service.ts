import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/modules/users/users.service';
import { RoleType } from 'src/common/enum/role-type.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
}

interface RefreshJwtPayload {
  sub: string;
  type: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  role: RoleType;
}

interface RefreshResponse {
  accessToken: string;
  userId: string;
  email: string;
  role: RoleType;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getAccessSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || 'dev_secret';
  }

  private getRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET') || 'dev_refresh_secret';
  }

  private getAccessTtl(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN') || '15m';
  }

  private getRefreshTtl(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '30d';
  }

  async register(dto: RegisterDto) {
    if (dto.role === RoleType.SUPER_ADMIN) {
      throw new BadRequestException('لا يمكن إنشاء Super Admin عبر واجهة تسجيل المستخدم العادية');
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('البريد الإلكتروني مستخدم من قبل');
    }

    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: dto.password, 
      role: dto.role,
      phoneNumber: dto.phoneNumber,
      profileImage: dto.profileImage,
    });

    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }

async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || user.isDeleted) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.password);
    if (!passwordOk) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const userId = user._id.toString();

    const userPermissions = 'permissions' in user && Array.isArray(user.permissions) 
      ? user.permissions 
      : [];

    const accessPayload: JwtPayload = {
      sub: userId,
      email: user.email,
      role: user.role,
      permissions: userPermissions,
    };

    // 🌟 التعديل هنا: استخدام casting إلى Buffer | object
    const accessToken = await this.jwtService.signAsync(accessPayload as Buffer | object, {
      secret: this.getAccessSecret(),
      expiresIn: this.getAccessTtl() as any,
    });

    const refreshPayload: RefreshJwtPayload = {
      sub: userId,
      type: 'REFRESH_TOKEN',
    };

    // 🌟 التعديل هنا: استخدام casting إلى Buffer | object
    const refreshToken = await this.jwtService.signAsync(refreshPayload as Buffer | object, {
      secret: this.getRefreshSecret(),
      expiresIn: this.getRefreshTtl() as any,
    });

    return { 
      accessToken, 
      refreshToken, 
      userId, 
      email: user.email, 
      role: user.role as RoleType 
    };
  }

  async refresh(userId: string): Promise<RefreshResponse> {
    const user = await this.usersService.findById(userId);
    if (!user || user.isDeleted) {
      throw new UnauthorizedException('جلسة غير صالحة');
    }

    const userPermissions = 'permissions' in user && Array.isArray(user.permissions) 
      ? user.permissions 
      : [];

    const accessPayload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: userPermissions,
    };

    // 🌟 التعديل هنا: استخدام casting إلى Buffer | object
    const accessToken = await this.jwtService.signAsync(accessPayload as Buffer | object, {
      secret: this.getAccessSecret(),
      expiresIn: this.getAccessTtl() as any,
    });

    return { 
      accessToken, 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role as RoleType 
    };
  }
}