import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        });
        
        // Inject tenantId into the request object for Prisma Extension to pick up
        if (decoded && decoded.tenantId) {
          req['tenantId'] = decoded.tenantId;
        } else if (decoded && decoded.role === 'super_admin') {
          // Super admin doesn't have a strict tenantId constraint
          req['tenantId'] = null;
        }
      } catch (e) {
        // We don't throw error here, let the JwtAuthGuard handle it
      }
    }
    next();
  }
}
