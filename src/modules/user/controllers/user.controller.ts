import {
  Body,
  Controller,
  Get,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { PermissionsGuard } from '../../common/providers/permissions.guard';
import { AuthGuard } from '../providers/auth.guard';
import { UserService } from '../providers/user.service';
import { CreateUserPayload, UserReturnType } from '../types/user.type';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard, PermissionsGuard)
  @SetMetadata('entities', ['user'])
  async findAll(): Promise<UserReturnType[]> {
    return this.userService.getUsers();
  }

  @Post()
  @UseGuards(AuthGuard, PermissionsGuard)
  @SetMetadata('entities', ['user'])
  async create(@Body() createUserDto: CreateUserPayload) {
    return await this.userService.createUser(createUserDto);
  }
}
