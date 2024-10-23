import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SHA256 } from 'crypto-js';
import { PrismaService } from '../../common/providers/prisma.service';
import {
  CredentialsTokenPayload,
  GetTokenPayload,
  RefreshTokenPayload,
  TokenResponse,
} from '../types/auth.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async credentialsToken(
    payload: CredentialsTokenPayload,
  ): Promise<TokenResponse> {
    try {
      const where = {};
      if (payload.email) Object.assign(where, { email: payload.email });
      if (payload.username)
        Object.assign(where, { username: payload.username });

      const user = await this.prisma.user.findFirstOrThrow({
        where,
        include: { group: { select: { name: true } } },
      });
      console.log(where, user);
      const password = payload.salted
        ? payload.password
        : SHA256(process.env.SALT + payload.password).toString();
      if (user.password !== password) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return {
        role: user.group.name,
        access_token: await this.jwtService.signAsync({
          sub: user.id,
          username: user.username,
        }),
        refresh_token: await this.jwtService.signAsync({
          sub: user.password,
          username: user.username,
        }),
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new UnauthorizedException('User not found');
      }
      throw error;
    }
  }

  async refreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<TokenResponse> {
    try {
      const { username, sub } = await this.jwtService.verifyAsync(
        payload.refresh_token,
        {
          secret: process.env.JWT_SECRET,
        },
      );
      return this.credentialsToken({
        username: username,
        password: sub,
        salted: true,
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async token(payload: GetTokenPayload): Promise<TokenResponse> {
    switch (payload.grant_type) {
      case 'refresh_token':
        return this.refreshTokenPayload(payload);
      case 'credentials':
        return this.credentialsToken(payload);
      default:
        throw new UnauthorizedException();
    }
  }
}
