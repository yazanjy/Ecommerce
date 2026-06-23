import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { RoleType } from 'src/common/enum/role-type.enum';
import { UserStatus } from 'src/common/enum/user-status';
import { GenderType } from 'src/common/enum/gender-type';
import { IsEnum, IsOptional } from 'class-validator';
import { PermissionType } from 'src/common/enum/permission.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ description: 'اسم المستخدم' })
  @Prop({ required: true })
  username: string;

 @ApiProperty({ description: 'البريد الإلكتروني للمستخدم' })
@Prop({ required: true }) // 👈 قمنا بحذف unique: true من هنا لأنها مكررة بالأسفل
email: string;

    @ApiProperty({ description: 'كلمة المرور للمستخدم' })
    @Prop({ required: true })
    password: string;

    @ApiProperty({ description: 'دور المستخدم', enum: RoleType })
    @Prop({ required: true, enum: RoleType })
    @IsEnum(RoleType)
    role: RoleType;

    @ApiPropertyOptional({ description: 'رقم الهاتف', example: '+9627xxxxxxx' })
    @Prop({ type: String, trim: true, index: true })
    @IsOptional()
    phoneNumber?: string;

    @ApiPropertyOptional({ description: 'حالة المستخدم', enum: UserStatus })
    @Prop({ enum: UserStatus, default: UserStatus.ACTIVE })
    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;

    @ApiPropertyOptional({ description: 'جنس المستخدم', enum: GenderType })
    @Prop({ enum: GenderType })
    @IsEnum(GenderType)
    @IsOptional()
    gender?: GenderType;

    @ApiPropertyOptional({ description: 'الصلاحيات المخصصة للمستخدم', enum: PermissionType, isArray: true })
    @Prop({ type: [String], enum: PermissionType })
    @IsEnum(PermissionType, { each: true })
    @IsOptional()
    permissions?: PermissionType[];


    @ApiPropertyOptional({ description: 'تاريخ آخر تسجيل دخول للمستخدم' })
    @Prop({ type: Date })
    @IsOptional()
    lastLoginAt?: Date;

    @ApiPropertyOptional({ description: 'صورة الملف الشخصي للمستخدم' })
    @Prop({ type: String })
    @IsOptional()
    profileImage?: string;

 @ApiPropertyOptional({ description: 'هل الحساب محذوف (Soft Delete)' })
    @Prop({ type: Boolean, default: false }) // 🎯 التعديل الصحيح: بوليان ويبدأ بـ false تلقائياً
    isDeleted: boolean;


    @ApiPropertyOptional({ description: 'تاريخ حذف المستخدم' })
    @Prop({ type: Date })
    @IsOptional()
    deletedAt?: Date;

    @ApiPropertyOptional({ description: 'سبب حذف المستخدم' })
    @Prop({ type: String })
    @IsOptional()
    deleteReason?: string;
}
//index
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: 'string' },
    },
  },
);


UserSchema.index({ role: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ status: 1 });


