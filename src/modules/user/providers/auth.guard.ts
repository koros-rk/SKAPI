import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as process from 'node:process';
import { PrismaService } from '../../common/providers/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const { sub, username } = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      await this.prisma.user.findFirstOrThrow({
        where: { id: sub, username: username },
        include: { group: { select: { name: true } } },
      });

      request['user'] = { sub, username };
    } catch {
      throw new UnauthorizedException('INVALID TOKEN');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
