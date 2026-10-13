import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? 'Email is already registered'
          : 'Phone number is already registered',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: passwordHash,
        phone: dto.phone,
        roles: [UserRole.PASSENGER],
      },
      select: { id: true, name: true, email: true, phone: true, roles: true, createdAt: true },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.roles);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const tokens = await this.issueTokens(user.id, user.email, user.roles);
    const { password: _p, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async refresh(userId: string, tokenId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, roles: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    await this.prisma.refreshToken.delete({ where: { id: tokenId } }).catch(() => {});
    return this.issueTokens(user.id, user.email, user.roles);
  }

  async logout(tokenId: string) {
    await this.prisma.refreshToken.delete({ where: { id: tokenId } }).catch(() => {});
    return { message: 'Logged out successfully' };
  }

  private async issueTokens(userId: string, email: string, roles: UserRole[]) {
    const accessSecret = this.config.get<string>('app.jwtAccessSecret') as string;
    const refreshSecret = this.config.get<string>('app.jwtRefreshSecret') as string;
    const accessExpiresIn = this.config.get<string>('app.jwtAccessExpiresIn') as string;
    const refreshExpiresIn = this.config.get<string>('app.jwtRefreshExpiresIn') as string;

    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, roles },
      { secret: accessSecret, expiresIn: accessExpiresIn as any },
    );

    const tokenId = randomUUID();
    const expiresInMs = this.parseExpiry(refreshExpiresIn);

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, jti: tokenId },
      { secret: refreshSecret, expiresIn: refreshExpiresIn as any },
    );

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        tokenHash,
        userId,
        expiresAt: new Date(Date.now() + expiresInMs),
      },
    });

    return { accessToken, refreshToken };
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[match[2]] ?? 1000);
  }
}
