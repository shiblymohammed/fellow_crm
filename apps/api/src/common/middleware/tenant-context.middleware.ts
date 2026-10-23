import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cls: ClsService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          throw new Error('JWT_SECRET not configured');
        }
        
        const decoded = this.jwtService.verify(token, { secret: jwtSecret });
        
        // Inject tenantId into the request object and CLS context for Prisma Extension to pick up
        if (decoded && decoded.tenantId) {
          req['tenantId'] = decoded.tenantId;
          this.cls.set('tenantId', decoded.tenantId);
        } else if (decoded && decoded.role === 'super_admin') {
          // Super admin doesn't have a strict tenantId constraint
          req['tenantId'] = null;
          this.cls.set('tenantId', null);
        } else if (decoded) {
          // Valid token but no tenantId and not super_admin.
          // Assign a fake UUID to prevent Prisma filter bypass.
          const fakeTenant = '00000000-0000-0000-0000-000000000000';
          req['tenantId'] = fakeTenant;
          this.cls.set('tenantId', fakeTenant);
        }
      } catch (e) {
        // We don't throw error here, let the JwtAuthGuard handle it
      }
    }
    next();
  }
}
