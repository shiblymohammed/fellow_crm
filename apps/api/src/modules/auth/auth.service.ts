import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, agencyName } = registerDto;
    
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate a simple slug from agency name
    const slug = agencyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Find the default Basic plan
    const basicPlan = await this.prisma.plan.findFirst({
      where: { name: 'Basic' }
    });

    // Since this is a public route without a tenantId context, the Prisma extension allows this creation globally
    const tenant = await this.prisma.tenant.create({
      data: {
        name: agencyName,
        slug,
        status: 'trial',
        ownerEmail: email,
        ownerName: name,
        ...(basicPlan ? { plan: { connect: { id: basicPlan.id } } } : {}),
      }
    });

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'agency_owner',
        tenantId: tenant.id,
      }
    });

    // Auto login after registration
    return this.login({ email, password });
  }

  async refreshToken(token: string) {
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    try {
      const decoded = this.jwtService.verify(token, { secret: jwtRefreshSecret });
      
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        include: { tenant: true }
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
      
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new UnauthorizedException('JWT configuration error');
      }
      
      const accessToken = this.jwtService.sign(payload, {
        secret: jwtSecret,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      });

      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

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
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets not configured');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtRefreshSecret,
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { success: true, message: 'If an account exists with that email, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { success: true, message: 'If an account exists with that email, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { success: true, message: 'Password successfully reset. You can now log in.' };
  }
}
