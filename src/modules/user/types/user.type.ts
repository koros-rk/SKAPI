import { Prisma, User } from '@prisma/client';

export type UserOmittedFields = 'group' | 'id' | 'Token' | 'password';

export interface CreateUserPayload
  extends Partial<Omit<Prisma.UserCreateInput, UserOmittedFields>> {
  email: string;
  password: string;
  group: string;
}

export interface UserReturnType
  extends Omit<User, UserOmittedFields | 'group_id'> {
  group: string;
}
