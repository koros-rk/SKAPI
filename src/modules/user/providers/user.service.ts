import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SHA256 } from 'crypto-js';
import * as process from 'node:process';
import { PrismaService } from '../../common/providers/prisma.service';
import { CreateUserPayload, UserReturnType } from '../types/user.type';

@Injectable()
export class UserService {
  private UserSelectFields = {
    id: true,
    group: { select: { name: true } },
    email: true,
    first_name: true,
    second_name: true,
    username: true,
  };

  constructor(private prisma: PrismaService) {}

  async getUsers(): Promise<UserReturnType[]> {
    const users = await this.prisma.user.findMany({
      select: this.UserSelectFields,
    });

    return users.map((user) => ({ ...user, group: user.group.name }));
  }

  async createUser(data: CreateUserPayload): Promise<UserReturnType> {
    try {
      const group = await this.prisma.group.findFirstOrThrow({
        where: { name: data.group },
      });

      const password = SHA256(process.env.SALT + data.password).toString();

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          first_name: data.first_name ?? '',
          second_name: data.second_name ?? '',
          username: data.username ?? '',
          group: { connect: { id: group.id } },
          password,
        },
        select: this.UserSelectFields,
      });

      return { ...user, group: user.group.name };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'User with similar credentials already exists',
        );
      }
      throw new InternalServerErrorException();
    }
  }
}
