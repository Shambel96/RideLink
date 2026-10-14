import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash } from 'crypto';

export interface RefreshPayload {
  sub: string;
  jti: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwtRefreshSecret') as string,
      passReqToCallback: true as true,
    });
  }

  async validate(req: Request, payload: RefreshPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) throw new UnauthorizedException('Refresh token missing');

    const tokenHash = createHash('sha256').update(token).digest('hex');

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });

    if (
      !storedToken ||
      storedToken.tokenHash !== tokenHash ||
      storedToken.userId !== payload.sub ||
      storedToken.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    return { sub: payload.sub, jti: payload.jti };
  }
}
