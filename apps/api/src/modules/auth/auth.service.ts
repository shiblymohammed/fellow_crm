import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check tenant status if user belongs to one
    if (user.tenantId && user.tenant) {
      const { status, subscriptionEndsAt, trialEndsAt } = user.tenant;
      
      if (status === 'suspended') {
        throw new UnauthorizedException('Your agency account is suspended. Please contact support.');
      }
      
      const now = new Date();
      if (status === 'trial' && trialEndsAt && now > trialEndsAt) {
        throw new UnauthorizedException('Your trial has expired. Please upgrade to continue.');
      }
      
      if (status === 'expired' || (subscriptionEndsAt && now > subscriptionEndsAt)) {
        throw new UnauthorizedException('Your subscription has expired. Please renew to continue.');
      }
    }

    // Generate tokens
    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken, // Usually set in HTTP-Only cookie, returning it here for simplicity
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantSlug: user.tenant?.slug,
      },
    };
  }
}
