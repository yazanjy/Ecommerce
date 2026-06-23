import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';


import { hash } from 'bcrypt';
import { RoleType } from 'src/common/enum/role-type.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schemas';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: Partial<CreateUserDto> & { email: string; password: string }) {
    // This service is also used by AuthService.
    const created = new this.userModel({
      ...(createUserDto as any),
      password: await hash((createUserDto as any).password, 10),
    });

    return created.save();
  }

  async findByEmail(email: string) {
    if (!email) return null;
    console.log('Finding user by email:', email);
    const user = await this.userModel.findOne({ email, isDeleted: false } as any);
    return user;
  }

  async findById(id: string) {
    if (!id) return null;
    const user = await this.userModel.findById(id);
    return user;
  }

  // Below CRUD endpoints are kept for backward compatibility with existing controller.
  createLegacy(createUserDto: any) {
    return this.create(createUserDto);
  }

  findAll() {
    return this.userModel.find({ isDeleted: false });
  }

  findOne(id: number) {
    return this.userModel.findById(id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  remove(id: number) {
    return this.userModel.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
  }
}

