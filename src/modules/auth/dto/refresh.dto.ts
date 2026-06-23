import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @ApiPropertyOptional({ description: 'اختياري: قد يتم إرسال Refresh token عبر Cookie تلقائياً' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

