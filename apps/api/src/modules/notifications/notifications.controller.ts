import { Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { StaffNotificationService } from './staff-notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifService: StaffNotificationService) {}

  @Get()
  async getUserNotifications(
    @TenantId() tenantId: string,
    @User('userId') userId: string,
    @Query('limit') limit?: string
  ) {
    const data = await this.notifService.getUserNotifications(userId, limit ? parseInt(limit) : 50);
    return { data };
  }

  @Patch('read-all')
  async markAllAsRead(@User('userId') userId: string) {
    return this.notifService.markAllAsRead(userId);
  }
}
