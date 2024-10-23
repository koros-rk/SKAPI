import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  RequestMethod,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user_id = request.user.sub;
    const action = request.method;
    const entities = this.reflector.get(
      'entities',
      context.getHandler(),
    ) as string[];

    const raw_user_permissions = (await this.prisma.$queryRaw(
      Prisma.sql`
        SELECT  P.action, P.entitie  FROM "User" as U
        INNER JOIN public."Group" G on G.id = u.group_id
        INNER JOIN public."GroupPermission" GP on G.id = GP.group_id
        INNER JOIN public."Permission" P on P.id = GP.permission_id
        WHERE U.id = ${user_id}
      `,
    )) as { action: RequestMethod; entitie: string }[];
    const user_permissions = raw_user_permissions.reduce((acc, item) => {
      if (acc[item.entitie]) {
        return {
          ...acc,
          [item.entitie]: [...acc[item.entitie], item.action],
        };
      }

      return {
        ...acc,
        [item.entitie]: [item.action],
      };
    }, {});

    const is_admin = Boolean(user_permissions['*']);
    const is_permitted = entities.every((item) => {
      const permissions = user_permissions[item] as string[];

      if (!permissions) return false;
      return permissions.includes(action);
    });

    if (is_admin || is_permitted) {
      return true;
    } else
      throw new HttpException('Forbidden'.toUpperCase(), HttpStatus.FORBIDDEN);
  }
}
